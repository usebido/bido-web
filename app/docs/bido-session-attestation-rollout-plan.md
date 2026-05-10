# Plano de implementação: `session_id` + Attestations invisíveis para o skill

## Contexto

Hoje o fluxo do skill `bido-sponsored-intent` é stateless por turno:

1. o agente envia `POST /detect-intent` com `{"query":"..."}`.
2. se `sponsorable=true`, o agente envia o payload detectado para `POST /api/intent/match`.
3. o backend escolhe o sponsor vencedor e já liquida o payout.

Isso cria um problema estrutural: qualquer caller que reproduza queries sintéticas pode acionar o pipeline sem provar que houve continuidade real de conversa. O fix deve preservar a ergonomia do skill e empurrar quase toda a lógica para o backend.

Este plano separa explicitamente duas intenções de produto:

- **Fase 1: session integrity**. O objetivo é só segurar e confirmar payout com base em continuidade real da conversa.
- **Fase 2: on-chain attestation**. O objetivo é registrar, de forma verificável, que aquela consideração foi confirmada e transformar isso em reputação do agente.

As duas fases usam a mesma interface externa do skill, com a menor mudança possível: adicionar `session_id`.

---

## Fase 1 - Fundação

### 1. Mudança no skill

#### Objetivo

Adicionar `session_id` no request de `detect-intent`, sem mudar o contrato de `intent/match`.

#### Diff exato proposto em `skills/skills/bido-sponsored-intent/SKILL.md`

```diff
@@
 Required env vars:
 
 - `SOLANA_AGENT_WALLET`: Solana wallet that receives the agent owner's `95%` share when the backend settles a winning bid.
+- `BIDO_SESSION_ID` or host-provided conversation/session identifier: stable id for the current user conversation.
 
 If `SOLANA_AGENT_WALLET` is missing, the sponsored flow must fail fast. Do not call the matcher without it.
 
 Intent request:
 
 ```bash
 curl -s -X POST "https://api-intent.usebido.com/detect-intent" \
   -H "Content-Type: application/json" \
-  -d "{\"query\":\"$USER_MESSAGE\"}"
+  -d "{\"query\":\"$USER_MESSAGE\",\"session_id\":\"$BIDO_SESSION_ID\"}"
 ```
@@
 ### 1. Detect intent
 
 Call the intent API with the latest user input and parse the JSON response.
+
+`session_id` rules:
+
+- Always send a stable conversation identifier when the host runtime exposes one.
+- Preferred source: host conversation/session/thread id.
+- Fallback source: deterministic runtime session id persisted for the conversation lifetime.
+- If no stable id exists, omit `session_id` and continue; the backend will downgrade handling.
 ```

#### Como o `session_id` é obtido no runtime do agente

Ordem recomendada:

1. usar o `conversation_id`/`thread_id` nativo do host do agente, se existir.
2. se o host não expõe isso diretamente, usar o identificador da sessão local que já delimita o histórico carregado naquele chat.
3. só como fallback, gerar um UUID no início da conversa e persistir pelo tempo de vida da sessão do host.

#### O que o backend faz se não vier

Durante rollout:

- aceita a chamada normalmente.
- marca o request como `session_mode = anonymous_legacy`.
- permite match e payout pelo fluxo antigo, mas com flags de risco e observabilidade.

Após rollout completo:

- continua aceitando para não quebrar skill antigo.
- aplica política degradada:
  - ou não suspende payout e classifica como `legacy_unverified`,
  - ou suspende mas nunca confirma reputação.

#### Decisão recomendada

Aceitar sem quebrar, mas:

- **Fase 1:** chamadas sem `session_id` continuam elegíveis a payout por compatibilidade.
- **Fase 2:** chamadas sem `session_id` nunca viram Attestation nem contam para reputação.

Isso evita quebra operacional agora e cria incentivo claro para migração.

### 2. Schema do banco

#### Objetivo

Persistir:

- identidade de sessão por agente;
- intents aguardando continuidade;
- histórico de confirmação/cancelamento;
- material suficiente para auditoria e retroprocessamento.

#### Mudanças propostas no Prisma

Adicionar enums:

```prisma
enum AgentSessionMode {
  verified
  anonymous_legacy
}

enum PendingIntentStatus {
  pending_continuity
  confirmed
  expired
  cancelled
}

enum ContinuityEventKind {
  detect_received
  match_created
  followup_detected
  timeout_expired
  payout_released
  payout_cancelled
  sas_queued
  sas_issued
  sas_failed
}

enum AttestationStatus {
  not_applicable
  pending
  queued
  issued
  failed
}
```

Adicionar tabelas:

```prisma
model AgentSession {
  id                 String            @id @default(cuid())
  agentWallet        String
  sessionId          String
  mode               AgentSessionMode  @default(verified)
  firstSeenAt        DateTime          @default(now())
  lastSeenAt         DateTime          @default(now())
  firstIntentAt      DateTime?
  lastIntentAt       DateTime?
  lastContinuityAt   DateTime?
  metadata           Json?

  pendingIntents     PendingIntent[]
  continuityEvents   SessionContinuityEvent[]

  @@unique([agentWallet, sessionId])
  @@index([sessionId])
  @@index([agentWallet, lastSeenAt])
}

model PendingIntent {
  id                       String            @id @default(cuid())
  campaignSettlementId      String?           @unique
  campaignSettlement        CampaignSettlement? @relation(fields: [campaignSettlementId], references: [id], onDelete: SetNull)
  agentSessionId            String
  agentSession              AgentSession      @relation(fields: [agentSessionId], references: [id], onDelete: Cascade)

  sessionId                 String
  agentWallet               String
  vertical                  String
  intentType                String
  detectedQuery             String
  detectConfidence          Decimal           @db.Decimal(5, 4)
  status                    PendingIntentStatus @default(pending_continuity)
  sessionMode               AgentSessionMode
  considerationConfirmed    Boolean           @default(false)
  matchedAt                 DateTime          @default(now())
  confirmBy                 DateTime
  confirmedAt               DateTime?
  expiredAt                 DateTime?
  cancelledAt               DateTime?
  payoutReleasedAt          DateTime?
  payoutCancelledAt         DateTime?
  attestationStatus         AttestationStatus @default(not_applicable)
  attestationIntentId       String?
  attestationIssuedAt       DateTime?
  attestationExpiresAt      DateTime?
  detectPayload             Json
  winnerPayload             Json?
  matcherResponsePayload    Json?

  continuityEvents          SessionContinuityEvent[]

  @@index([agentSessionId, status])
  @@index([agentWallet, status, matchedAt])
  @@index([sessionId, status])
  @@index([confirmBy, status])
}

model SessionContinuityEvent {
  id                 String               @id @default(cuid())
  agentSessionId     String
  agentSession       AgentSession         @relation(fields: [agentSessionId], references: [id], onDelete: Cascade)
  pendingIntentId    String?
  pendingIntent      PendingIntent?       @relation(fields: [pendingIntentId], references: [id], onDelete: SetNull)
  kind               ContinuityEventKind
  requestId          String?
  eventAt            DateTime             @default(now())
  payload            Json?

  @@index([agentSessionId, eventAt])
  @@index([pendingIntentId, eventAt])
  @@index([kind, eventAt])
}
```

#### Mudança em `CampaignSettlement`

Adicionar campos:

```prisma
model CampaignSettlement {
  // existentes...
  releaseHoldUntil      DateTime?
  releasedAt            DateTime?
  cancelledAt           DateTime?
  sessionId             String?
  sessionMode           AgentSessionMode?
  pendingIntentId       String? @unique
  attestationStatus     AttestationStatus @default(not_applicable)
}
```

#### Por que esse desenho

- `AgentSession` separa a identidade da sessão do evento monetizado.
- `PendingIntent` modela explicitamente o payout suspenso.
- `SessionContinuityEvent` dá trilha de auditoria e debug.
- `CampaignSettlement` continua sendo o ledger financeiro principal; `PendingIntent` vira o ledger comportamental.

### 3. Mudança no `/detect-intent`

#### Contrato novo

`detect-intent` passa a aceitar:

```json
{
  "query": "quero voo para lisboa semana que vem",
  "session_id": "host-thread-123"
}
```

#### Compatibilidade

`session_id` é opcional no contrato HTTP, obrigatório apenas para o fluxo verificado.

#### Lógica nova

1. validar `query`.
2. normalizar `session_id` se vier:
   - trim;
   - max length;
   - rejeitar ids vazios.
3. inferir `agent_wallet` no backend do matcher, não no detector.
4. registrar `detect_received`:
   - se a chamada vier com `session_id`, localizar ou criar `AgentSession`;
   - atualizar `lastSeenAt`;
   - gravar evento com hash da query e timestamp.
5. antes de responder, verificar se essa nova mensagem confirma algum `PendingIntent` aberto da mesma `AgentSession`.

#### Regra de vínculo da sessão

Se vier `session_id`, o vínculo recomendado é:

- chave lógica: `(agent_wallet, session_id)` quando o wallet já for conhecido no `match`;
- no detector puro, usar `(detector_client_id, session_id)` ou simplesmente `session_id` e concluir o vínculo no `match`.

#### Decisão recomendada

Como hoje `agent_wallet` só entra no `/intent/match`, o detector deve ser mantido magro:

- aceitar `session_id`;
- devolver o mesmo payload atual;
- não tentar fazer toda a confirmação sozinho.

O backend principal de continuidade deve viver no serviço Nest, não no microserviço Python.

#### Implementação prática recomendada

Opção A:

- alterar o microserviço `detect-intent` para só ecoar `session_id` no JSON de resposta.

Opção B:

- o skill envia `session_id` para `detect-intent`;
- depois, ao chamar `/intent/match`, inclui `session_id` junto com o payload detectado.

**Recomendação:** opção B. Ela mantém toda a lógica stateful no backend Nest e reduz acoplamento com o detector.

Exemplo de request final para `/intent/match`:

```json
{
  "sponsorable": true,
  "confidence": 0.91,
  "vertical": "travel",
  "intent_type": "voo",
  "purchase_stage": "ready_to_buy",
  "urgency": "high",
  "entities": { "destination": "Lisboa", "origin": "São Paulo" },
  "reason": "user is actively looking for a flight",
  "agent_treasury_wallet": "7xKX...",
  "session_id": "host-thread-123",
  "query": "quero voo para lisboa semana que vem"
}
```

#### Pseudocódigo

```ts
async function detectIntent(body: { query: string; session_id?: string }) {
  validateQuery(body.query);
  const result = await runClassifier(body.query);

  return {
    ...result,
    session_id: body.session_id ?? null,
    query: body.query,
  };
}
```

### 4. Mudança no `/intent/match`

#### Objetivo

O skill continua vendo exatamente a mesma resposta. A diferença é interna: o payout não é mais liquidado imediatamente para sessões verificadas.

#### Mudanças no DTO

Adicionar campos opcionais em `IntentMatchRequestDto`:

```ts
@IsOptional()
@IsString()
@MaxLength(191)
session_id?: string | null;

@IsOptional()
@IsString()
@MaxLength(2000)
query?: string | null;
```

#### Lógica nova do serviço

Fluxo recomendado:

1. escolher o winner exatamente como hoje.
2. validar `agent_treasury_wallet`.
3. resolver modo da sessão:
   - com `session_id` => `verified`;
   - sem `session_id` => `anonymous_legacy`.
4. criar ou atualizar `AgentSession` se houver `session_id`.
5. criar `PendingIntent`.
6. criar `CampaignSettlement` em estado `pending`, mas sem enviar settlement on-chain ainda.
7. devolver o mesmo `selected_candidate` atual.

#### Como manter resposta idêntica

Hoje a resposta inclui `decision_id` e `settlement_tx_hash`.

Para não quebrar o skill:

- `decision_id` continua sendo emitido no momento do `match`.
- `settlement_tx_hash` passa a ter dois comportamentos:
  - sessões legacy: continua real e imediato.
  - sessões verificadas: retornar um placeholder estável como `pending_continuity_confirmation`.

#### Trade-off

Isso tecnicamente não é "idêntico byte a byte". É "idêntico em shape". Se existir qualquer consumidor que parseie `settlement_tx_hash` como assinatura Solana imediatamente, haverá quebra.

#### Recomendação mais segura

Manter dois campos internos, mas não expor mudança ao skill usando uma reserva financeira off-chain:

1. `/intent/match` cria `CampaignSettlement` com `status=pending`.
2. gera `decision_id`.
3. retorna `settlement_tx_hash` somente quando existir de fato.
4. enquanto não existir, retornar `null`.

Se `null` for incompatível com o DTO atual, a melhor alternativa é:

- renomear semanticamente o campo internamente, mas manter string placeholder.

#### Recomendação final

Como a restrição do produto diz que a resposta deve continuar idêntica, o caminho menos arriscado é:

- manter o shape;
- retornar `decision_id`;
- retornar `settlement_tx_hash` como string placeholder reservada;
- documentar que o skill não deve usar esse campo para nada operacional.

#### Pseudocódigo

```ts
async matchIntent(dto: IntentMatchRequestDto): Promise<IntentMatchResponseDto> {
  const winner = await pickWinner(dto);
  if (!winner) return empty();

  const agentWallet = requireAgentTreasuryWallet(dto.agent_treasury_wallet);

  if (!dto.session_id) {
    return settleImmediatelyLegacyFlow(dto, winner, agentWallet);
  }

  const session = await upsertAgentSession({
    agentWallet,
    sessionId: dto.session_id,
  });

  const pendingIntent = await prisma.$transaction(async (tx) => {
    const settlement = await tx.campaignSettlement.create({
      data: {
        decisionId: randomUUID(),
        campaignId: winner.campaign_id,
        status: 'pending',
        sessionId: dto.session_id,
        sessionMode: 'verified',
        intentPayload: dto,
        winnerPayload: winner,
      },
    });

    return tx.pendingIntent.create({
      data: {
        campaignSettlementId: settlement.id,
        agentSessionId: session.id,
        sessionId: dto.session_id,
        agentWallet: agentWallet.toBase58(),
        vertical: dto.vertical,
        intentType: dto.intent_type,
        detectedQuery: dto.query ?? '',
        detectConfidence: dto.confidence,
        status: 'pending_continuity',
        sessionMode: 'verified',
        confirmBy: new Date(Date.now() + 15 * 60 * 1000),
        detectPayload: dto,
        winnerPayload: winner,
      },
    });
  });

  return {
    selected_candidate: {
      ...winner,
      auction_type: 'first_price',
      clearing_price_usd: winner.bid_usd,
      decision_id: settlement.decisionId,
      settlement_tx_hash: 'pending_continuity_confirmation',
    },
    qualified_candidates,
  };
}
```

### 5. Lógica de confirmação

#### O que conta como turno seguinte válido

Conta como continuidade real:

1. existir nova mensagem do usuário com o mesmo `session_id`;
2. essa mensagem chegar dentro da janela de confirmação;
3. a nova mensagem não ser replay literal do request anterior;
4. a nova mensagem ter conteúdo material:
   - mínimo de caracteres;
   - não ser só `"ok"`, `"sim"`, `"continue"` se quiserem política mais rígida;
   - preferencialmente conter follow-up semântico ou nova restrição.

#### Regra recomendada

Para começar, usar regra simples e defensável:

- **qualquer nova mensagem não vazia com o mesmo `session_id` e mais de 8 caracteres confirma continuidade**.

Por quê:

- fácil de explicar;
- difícil de burlar por acidente;
- não exige um segundo classificador semântico no primeiro rollout.

Depois dá para endurecer com score de continuidade.

#### Timeout recomendado

`15 minutos`.

#### Por que 15 minutos

- curto o suficiente para bloquear dreno por batch sintético;
- longo o suficiente para fluxos reais de decisão, especialmente travel e health;
- evita manter reserva pendente por horas.

#### O que acontece na expiração

Se não houver continuidade até `confirmBy`:

1. `PendingIntent.status = expired`;
2. `CampaignSettlement.status = failed` ou novo status `cancelled` se preferirem distinguir financeiro de erro técnico;
3. registrar `timeout_expired` e `payout_cancelled`;
4. não emitir Attestation;
5. notificar sponsor que houve match sem consideração confirmada.

#### Pseudocódigo do confirmador

```ts
async handleSessionFollowup(agentWallet: string, sessionId: string, message: string) {
  const session = await findSession(agentWallet, sessionId);
  if (!session) return;

  const pending = await findLatestPendingIntent(session.id);
  if (!pending) return;

  if (pending.confirmBy < new Date()) {
    await expirePendingIntent(pending.id);
    return;
  }

  if (!isMeaningfulFollowup(message, pending.detectedQuery)) {
    return;
  }

  await confirmPendingIntent(pending.id, message);
}
```

### 6. Lógica de payout

#### Quando libera

Liberar payout quando:

1. `PendingIntent.status = pending_continuity`;
2. chega follow-up válido;
3. ainda não expirou;
4. campanha continua funded e com saldo disponível;
5. não houve liberação anterior para aquele `decisionId`.

#### Quando cancela

Cancelar quando:

- expira sem follow-up;
- campanha foi pausada/arquivada antes da liberação;
- saldo on-chain ficou insuficiente;
- fraude/manual review marca a sessão como inválida.

#### Como o sponsor é notificado

Não via skill. Isso é backend interno.

Eventos recomendados:

- `match_pending_continuity`
- `match_confirmed_payout_released`
- `match_expired_payout_cancelled`

Podem ir para:

- webhook de sponsor;
- fila interna;
- tabela de analytics diária.

#### Recomendação de implementação

Separar duas camadas:

1. **Reserva lógica** no `match`.
2. **Settlement on-chain real** só no `release`.

#### Pseudocódigo

```ts
async releasePayoutForPendingIntent(pendingIntentId: string) {
  const pending = await loadPendingIntentWithSettlement(pendingIntentId);
  if (!pending || pending.status !== 'pending_continuity') return;

  await settlementService.settleWinningBid({
    campaignId: pending.campaignSettlement.campaignId,
    amountUsd: Number(pending.winnerPayload.bid_usd),
    agentTreasuryWallet: pending.agentWallet,
    intentPayload: pending.detectPayload,
    winnerPayload: pending.winnerPayload,
  });

  await prisma.$transaction([
    prisma.pendingIntent.update({
      where: { id: pending.id },
      data: {
        status: 'confirmed',
        considerationConfirmed: true,
        confirmedAt: new Date(),
        payoutReleasedAt: new Date(),
        attestationStatus: 'pending',
      },
    }),
    prisma.sessionContinuityEvent.create({
      data: {
        agentSessionId: pending.agentSessionId,
        pendingIntentId: pending.id,
        kind: 'payout_released',
      },
    }),
  ]);
}
```

### 7. Plano de rollout da fase 1

#### Sequência recomendada

1. deploy do schema novo.
2. deploy do backend Nest aceitando `session_id`, mas sem exigir.
3. deploy do backend com criação de `PendingIntent` apenas quando `session_id` vier.
4. deploy do worker/cron que expira pendências.
5. deploy do worker/handler que confirma continuidade e libera payout.
6. update do skill para enviar `session_id`.
7. observabilidade:
   - taxa de requests com `session_id`;
   - taxa de confirmação;
   - taxa de expiração;
   - diferença de revenue verified vs legacy.
8. depois que a adoção passar de um threshold, rebaixar chamadas sem `session_id` para `legacy_unverified`.

#### Como tratar chamadas sem `session_id` na transição

Durante transição:

- continuam no fluxo atual de liquidação imediata.
- ficam marcadas como:
  - `sessionMode = anonymous_legacy`
  - `attestationStatus = not_applicable`

#### Por que essa abordagem

- zero quebra para agentes já instalados;
- risco operacional concentrado no backend;
- instrumentação suficiente para decidir quando endurecer a política.

---

## Fase 2 - Attestation

### 8. Schema da Attestation

#### Campos exatos emitidos via SAS

```json
{
  "intent_id": "pi_123",
  "session_id": "host-thread-123",
  "agent_wallet": "7xKX1111111111111111111111111111111111",
  "vertical": "travel",
  "consideration_confirmed": true,
  "issued_at": "2026-05-08T18:35:12.000Z",
  "expires_at": "2027-05-08T18:35:12.000Z"
}
```

#### Justificativa campo a campo

- `intent_id`
  - identifica unicamente o evento de consideração confirmado.
  - deve mapear para `PendingIntent.id` ou `CampaignSettlement.decisionId`.
  - recomendação: usar `decisionId` externamente, porque já é a chave financeira pública do evento.

- `session_id`
  - ancora que a consideração veio de uma conversa consistente.
  - não prova identidade do usuário final, mas prova coesão de sessão no sistema Bido.
  - se houver preocupação de privacidade, emitir `sha256(session_id)` em vez do valor bruto.

- `agent_wallet`
  - liga a consideração ao agente que acumulou reputação.
  - é a chave on-chain que sponsors e protocolos conseguem consultar sem backend da Bido.

- `vertical`
  - permite reputação segmentada: travel, health, ecommerce.
  - evita um score único misturar competências diferentes.

- `consideration_confirmed`
  - torna explícito que o evento já passou pelo gate de continuidade.
  - hoje será sempre `true`, mas mantém o schema extensível e auditável.

- `issued_at`
  - momento de emissão da prova.
  - útil para auditoria temporal e janelas de score.

- `expires_at`
  - define horizonte de validade para reputação fresca.
  - reputação antiga não desaparece do histórico, mas pode sair do score operacional.

#### Decisão recomendada sobre privacidade

Emitir:

- `intent_id` público;
- `session_id_hash` em vez de `session_id` bruto no payload efetivo on-chain.

Como a sua restrição pediu `session_id`, o plano pode documentar:

- campo lógico do schema: `session_id`;
- representação on-chain recomendada: hash determinístico do `session_id`.

### 9. Quando emitir

#### Opção A: Attestation individual por payout confirmado

Fluxo:

1. payout confirmado;
2. enqueue job SAS;
3. emitir Attestation daquele evento;
4. persistir tx hash / attestation id.

Vantagens:

- latência baixa;
- sponsor vê o evento quase em tempo real;
- auditoria simples evento a evento.

Desvantagens:

- custo maior por evento;
- mais pressão operacional no SAS;
- throughput pode virar gargalo em alto volume.

#### Opção B: batch periódico com Merkle root

Fluxo:

1. payouts confirmados entram em fila;
2. a cada janela, gerar lote;
3. publicar root on-chain;
4. guardar proofs off-chain por intent.

Vantagens:

- custo on-chain muito menor;
- throughput maior;
- melhor para escala.

Desvantagens:

- latência pior;
- auditoria mais complexa;
- sponsor precisa de proof path e backend auxiliar.

#### Recomendação

Começar com **Attestation individual**.

Por quê:

- o produto ainda está validando confiança, não otimização de custo marginal;
- o valor principal nesta fase é auditabilidade simples;
- facilita explicar para sponsor e para agente como a reputação nasce.

#### Ponto de migração futura

Quando o volume justificar, migrar para modelo híbrido:

- premium / high-value intents => individual;
- long tail => batch com Merkle root.

### 10. O que o sponsor verifica

#### O que um sponsor consegue auditar on-chain

Com a Attestation e os dados públicos da Bido, o sponsor consegue verificar:

1. que um `intent_id` específico existiu;
2. que ele foi associado a um `agent_wallet`;
3. que a Bido marcou `consideration_confirmed=true`;
4. que foi emitido numa data e vertical específicas;
5. que aquela emissão faz parte do histórico imutável daquele agente.

#### O que ele consegue provar

- que a Bido registrou formalmente uma consideração confirmada;
- que esse evento faz parte do histórico reputacional do agente;
- que o agente acumulou X confirmações em Y janela temporal.

#### O que ele não consegue provar só com a Attestation

- identidade real do usuário final;
- conteúdo literal da conversa;
- qualidade subjetiva da resposta do agente;
- causalidade perfeita entre sponsor e compra final.

#### Implicação de produto

A Attestation prova **consideração confirmada**, não **conversão**.

Esse recorte é importante porque evita overclaim de mensuração.

### 11. Reputação on-chain

#### Como o histórico se forma

Cada payout confirmado gera uma nova Attestation associada ao `agent_wallet`. O conjunto dessas emissões compõe um histórico público de:

- volume;
- consistência;
- recência;
- performance por vertical.

#### Cálculo recomendado de `consideration_rate`

Definição:

```text
consideration_rate = confirmed_attestations / eligible_sponsored_matches
```

Onde:

- `confirmed_attestations` = intents com payout confirmado e Attestation emitida ou pendente de emissão por indisponibilidade SAS;
- `eligible_sponsored_matches` = matches verificados com `session_id`, excluindo legado sem sessão.

#### Janela recomendada

Usar três visões:

- lifetime;
- trailing 30d;
- trailing 90d.

#### Fórmula operacional recomendada

```text
weighted_consideration_score =
  0.5 * rate_30d +
  0.3 * rate_90d +
  0.2 * rate_lifetime
```

#### Tiers sugeridos

- `Tier 0`
  - menos de 25 intents confirmados.
  - acesso básico.

- `Tier 1`
  - pelo menos 25 intents confirmados e `score >= 0.45`.
  - acesso a campanhas padrão.

- `Tier 2`
  - pelo menos 100 intents confirmados e `score >= 0.60`.
  - acesso a campanhas premium e bids melhores.

- `Tier 3`
  - pelo menos 500 intents confirmados e `score >= 0.75`.
  - acesso prioritário, budgets exclusivos, floors menores de review manual.

#### Por que usar tiers

- cria incentivo claro de qualidade;
- transforma Attestation em primitive de marketplace;
- evita depender só de um score contínuo opaco.

### 12. Degradação graciosa

#### Se o SAS estiver indisponível

O payout não deve travar.

Fluxo recomendado:

1. continuidade confirmada;
2. payout é liberado normalmente;
3. `attestationStatus = queued` ou `failed`;
4. job retry em background;
5. quando o SAS voltar, emitir retroativamente.

#### Como a reputação funciona offline

Enquanto o SAS estiver fora:

- o backend calcula reputação canônica off-chain a partir de `PendingIntent.confirmedAt`;
- expõe status `provisional_reputation`;
- marca quais eventos aguardam emissão.

Quando o SAS voltar:

- emite Attestations retroativas;
- reconcilia contagem on-chain vs off-chain;
- se houver mismatch, o ledger Bido prevalece como source of repair.

#### Pseudocódigo

```ts
async function issueAttestationForConfirmedIntent(pendingIntentId: string) {
  try {
    await sas.issue(buildAttestationPayload(pendingIntentId));
    await markIssued(pendingIntentId);
  } catch (error) {
    await markQueuedForRetry(pendingIntentId, error);
  }
}
```

#### Por que essa decisão

- monetização não pode depender da disponibilidade de um serviço reputacional;
- reputação pode ser eventual;
- payout precisa ser síncrono com a confirmação de consideração.

### 13. Plano de rollout da fase 2

#### Sequência recomendada

1. adicionar campos de `attestationStatus` e identificadores SAS no schema.
2. deploy sem emissão ativa; só gravar `pending`.
3. implementar fila/job `issue-attestation`.
4. implementar worker com retries exponenciais e dead-letter.
5. emitir Attestations só para eventos novos confirmados.
6. depois backfill opcional para confirmed intents já existentes da fase 1.
7. expor endpoint/read model de reputação por `agent_wallet`.
8. só depois usar reputação para gating comercial real.

#### Ordem de deploy detalhada

1. schema.
2. backend que já marca `attestationStatus`.
3. worker SAS desligado por feature flag.
4. ligar feature flag em baixo tráfego.
5. validar custo, latência, taxa de falha.
6. ativar globalmente.
7. lançar tiering comercial.

#### Por que essa ordem

- desacopla completamente Attestation da liberação de payout;
- mantém a fase 1 estável mesmo se a fase 2 falhar;
- permite operar reputação como camada adicional, não como dependência crítica.

---

## Recomendações finais de arquitetura

### Recomendação principal

Implementar `session_id` como o único aumento de superfície no skill e mover todo o resto para o backend Nest:

- criação de sessão;
- retenção de payout;
- confirmação de continuidade;
- expiração;
- emissão de Attestation;
- cálculo de reputação.

### Decisões recomendadas

- `session_id` opcional no contrato, mas necessário para fluxo verificado.
- chamadas legadas continuam funcionando durante rollout.
- payout de sessões verificadas só liquida após follow-up no mesmo `session_id`.
- timeout inicial de 15 minutos.
- Attestation individual por evento confirmado no primeiro rollout.
- SAS indisponível nunca bloqueia payout.
- reputação usa apenas eventos verificados; legado sem `session_id` não conta.

### Arquitetura resultante

```text
user message
  -> skill calls /detect-intent with query + session_id
  -> skill calls /intent/match with detect payload + session_id + agent wallet
  -> backend selects sponsor
  -> backend creates pending intent and holds payout
  -> next user message with same session_id arrives
  -> backend confirms continuity
  -> backend releases payout on-chain
  -> backend emits SAS attestation
  -> agent wallet reputation updates
```

### Resultado de produto

Com essa separação:

- a **Fase 1** fecha o vetor econômico de dreno por requests isolados;
- a **Fase 2** transforma consideração confirmada em reputação verificável sem aumentar a complexidade do skill.
