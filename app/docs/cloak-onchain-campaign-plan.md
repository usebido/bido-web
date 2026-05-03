# Arquitetura final: Cloak para privacidade nativa no funding de campanhas

## Objetivo

Implementar privacidade real na ativação on-chain das campanhas Bido usando Cloak, sem depender de wallet operacional intermediária e sem manter o funding público atual como modelo principal.

Neste desenho final:

- a campanha continua sendo criada off-chain no backend
- a ativação/funding on-chain passa a usar Cloak como origem privada dos fundos
- o programa `bido-campaign-program` passa a suportar funding privado nativo
- o orçamento da campanha continua contabilizado on-chain pelo programa Bido

O ponto central é simples:

- Cloak cuida da privacidade da origem dos fundos
- o programa Bido continua sendo a fonte oficial de truth para budget e settlement

## Fontes oficiais usadas

- Platform Overview: https://docs.cloak.ag/platform/overview
- Transaction Flows: https://docs.cloak.ag/platform/transaction-flows
- Viewing Keys and Compliance: https://docs.cloak.ag/architecture/viewing-keys-compliance
- Quickstart: https://docs.cloak.ag/sdk/quickstart
- SDK Examples: https://docs.cloak.ag/sdk/examples

Conclusões relevantes dessas docs:

- Cloak é baseado em shielded UTXOs e provas ZK
- o SDK documentado é `@cloak.dev/sdk`
- viewing keys e `nk` são client-side
- depósitos e withdraws são feitos via Shield Pool
- Cloak resolve privacidade de funding, mas não faz accounting de programas terceiros

## Estado atual do Bido

## Backend

Arquivos relevantes:

- `backend/src/campaigns/campaigns.controller.ts`
- `backend/src/campaigns/campaigns.service.ts`
- `backend/src/campaigns/campaign-funding.service.ts`
- `backend/src/campaigns/dto/create-campaign.dto.ts`
- `backend/prisma/schema.prisma`

Fluxo atual:

1. `POST /campaigns` cria a campanha no banco
2. `POST /campaigns/:campaignId/onchain/initialize/prepare`
3. `POST /campaigns/:campaignId/onchain/initialize/confirm`
4. `POST /campaigns/:campaignId/onchain/prepare`
5. `POST /campaigns/:campaignId/onchain/relay`
6. `POST /campaigns/:campaignId/onchain/confirm`

## Programa Solana

Arquivo relevante:

- `programs-sol/bido-campaign-program/src/lib.rs`

Instruções atuais:

- `InitializeCampaign`
- `DepositCampaignBudget`
- `SettleWinningBid`

Limitação estrutural atual:

- `DepositCampaignBudget` exige uma source token account pública e faz ao mesmo tempo:
  - transferência de tokens
  - atualização do `CampaignState`

Isso impede uma integração realmente limpa com Cloak, porque o funding privado não deveria depender de uma transferência pública sponsor -> vault nem de uma wallet intermediária para fechar accounting.

## Frontend

Arquivos relevantes:

- `frontend/components/app/new-campaign-screen.tsx`
- `frontend/components/app/app-campaign-detail-screen.tsx`
- `frontend/lib/campaign-types.ts`
- `frontend/lib/api/campaigns.ts`
- `frontend/lib/hooks/use-campaigns.ts`

Hoje a tela de criação só grava a campanha e a tela de detalhe executa o funding público.

## Direção final

Não tratar Cloak como “camada opcional” sobre o funding atual.

A arquitetura final correta é:

1. criação da campanha continua off-chain
2. campanha passa a declarar modo de funding privado
3. usuário inicializa a campanha on-chain
4. usuário move fundos para o Cloak
5. usuário faz um withdraw privado cujo destino operacional é o vault da campanha
6. o programa Bido recebe uma instrução específica para sincronizar esse funding privado com o `CampaignState`
7. backend confirma e ativa a campanha

Ou seja:

- não queremos wallet intermediária
- não queremos funding público direto
- não queremos saldo no vault sem accounting

Logo, o programa precisa mudar.

## Decisão arquitetural

## O programa Bido deve ser adaptado para Cloak

O contrato precisa parar de assumir que “funding” sempre significa:

- source ATA pública
- transfer pública dentro da instrução

Ele deve passar a suportar dois conceitos separados:

1. entrada física de fundos no vault
2. contabilização oficial desse funding na campanha

Hoje esses dois conceitos estão acoplados em `DepositCampaignBudget`.

Na arquitetura final, eles devem ser desacoplados.

## Mudança principal no programa

Adicionar uma nova instrução on-chain dedicada a funding privado, por exemplo:

- `FinalizePrivateCampaignFunding`

ou

- `SyncPrivateCampaignBudget`

Essa instrução será responsável por:

- validar a campanha
- ler o saldo atual do vault
- comparar o saldo do vault com o budget já contabilizado
- creditar o delta novo no `CampaignState`
- marcar que aquele funding privado já foi incorporado

## Modelo final do programa

## Instruções propostas

Manter:

- `InitializeCampaign`
- `SettleWinningBid`

Substituir a ideia atual de funding por duas formas explícitas:

- `DepositCampaignBudgetPublic`
- `FinalizePrivateCampaignFunding`

Na prática:

- o funding público pode continuar existindo para compatibilidade operacional
- mas o modelo alvo para campanhas privadas passa a ser `FinalizePrivateCampaignFunding`

## Comportamento de `FinalizePrivateCampaignFunding`

Ela deve:

1. receber `campaign_pda`
2. receber `vault_usdc_ata`
3. ler o saldo atual do vault
4. calcular `new_funding_atomic = vault_balance - accounted_balance`
5. rejeitar se `new_funding_atomic <= 0`
6. somar `new_funding_atomic` em:
   - `budget_total`
   - `budget_available`
7. manter `budget_spent` intacto
8. persistir o novo saldo contabilizado

Para isso, o estado da campanha precisa de um novo campo:

- `accounted_vault_balance_atomic`

Esse campo passa a representar quanto do saldo do vault já foi incorporado ao orçamento oficial da campanha.

## Novos campos em `CampaignState`

Adicionar em `programs-sol/bido-campaign-program/src/lib.rs`:

- `funding_mode`
- `accounted_vault_balance_atomic`
- opcionalmente `private_funding_enabled`

Estrutura conceitual:

- `budget_total`
- `budget_available`
- `budget_spent`
- `accounted_vault_balance_atomic`

Regra:

- `accounted_vault_balance_atomic` nunca pode ficar menor que `budget_spent`
- `budget_available` deve continuar refletindo o saldo orçamentário utilizável, não simplesmente o saldo bruto do ATA

## Por que isso resolve

Com essa mudança:

- o Cloak pode fazer withdraw para o vault da campanha
- o funding continua privado na origem
- o contrato Bido continua controlando o accounting oficial
- `SettleWinningBid` continua funcionando sobre orçamento consistente

## Mudanças necessárias no backend

## Prisma

Adicionar em `backend/prisma/schema.prisma`:

- enum `CampaignPrivacyMode`
  - `public_direct`
  - `private_cloak`
- enum `CampaignPrivacyFundingStatus`
  - `not_started`
  - `setup_pending`
  - `deposit_pending`
  - `deposit_confirmed`
  - `withdraw_pending`
  - `withdraw_confirmed`
  - `finalization_pending`
  - `funded`
  - `failed`

Adicionar em `Campaign`:

- `privacyMode CampaignPrivacyMode @default(private_cloak)` se esse passar a ser o padrão desejado
- ou `@default(public_direct)` se quiser transição gradual
- `privacyFundingStatus CampaignPrivacyFundingStatus @default(not_started)`
- `cloakEnabled Boolean @default(true)` se privacidade virar padrão
- `cloakDepositTxHash String?`
- `cloakWithdrawTxHash String?`
- `cloakViewingKeyRegisteredAt DateTime?`
- `cloakLastError String?`
- `onchainAccountedVaultBalanceAtomic BigInt?`

Adicionar tabela operacional:

- `CampaignPrivacyActivation`
  - `campaignId`
  - `status`
  - `depositTxHash`
  - `withdrawTxHash`
  - `finalizationTxHash`
  - `withdrawAmountAtomic`
  - `errorMessage`
  - `createdAt`
  - `updatedAt`

## DTOs

Adicionar `privacyMode` em:

- `backend/src/campaigns/dto/create-campaign.dto.ts`
- `frontend/lib/campaign-types.ts`

Persistir isso em:

- `backend/src/campaigns/campaigns.service.ts`

Essa escolha define a arquitetura de funding da campanha, não a existência da campanha em si.

## Novo módulo Cloak

Criar:

- `backend/src/cloak/cloak.module.ts`
- `backend/src/cloak/cloak.service.ts`
- `backend/src/cloak/dto/*`

Esse módulo deve:

- armazenar estado do fluxo privado
- expor config pública necessária ao frontend
- registrar confirmações de depósito e withdraw
- reconciliar funding Cloak com finalização no programa Bido

O backend não deve custodiar na arquitetura preferida:

- spend keys
- viewing keys privadas
- notes completas
- `nk`

Modelo recomendado:

- Cloak non-custodial no frontend
- backend coordena workflow e reconciliação

## Endpoints finais necessários

Adicionar endpoints como:

- `POST /campaigns/:id/privacy/setup`
- `POST /campaigns/:id/privacy/deposit/confirm`
- `POST /campaigns/:id/privacy/withdraw/confirm`
- `POST /campaigns/:id/onchain/private-finalize/prepare`
- `POST /campaigns/:id/onchain/private-finalize/confirm`

Função prática:

- `setup`: marca readiness do fluxo Cloak
- `deposit/confirm`: persiste depósito shielded
- `withdraw/confirm`: persiste tx do withdraw para o vault da campanha
- `private-finalize/*`: prepara e confirma a instrução on-chain que converte saldo no vault em orçamento oficial

## Mudanças em `campaign-funding.service.ts`

Hoje o serviço prepara funding por transferência pública.

Ele deve passar a suportar:

### Funding público

- continua existindo se necessário

### Funding privado nativo

- preparar a instrução `FinalizePrivateCampaignFunding`
- ler o vault da campanha
- confirmar accounting após o withdraw Cloak
- atualizar `onchainBudgetTotalAtomic`
- atualizar `onchainBudgetAvailableAtomic`
- atualizar `onchainBudgetSpentAtomic`
- atualizar `onchainAccountedVaultBalanceAtomic`

Ponto importante:

- no fluxo privado, o backend não prepara uma transferência SPL sponsor -> vault
- ele prepara uma instrução de sincronização/contabilização do saldo que já entrou no vault via Cloak

## Mudanças necessárias no programa Solana

## Arquivo

- `programs-sol/bido-campaign-program/src/lib.rs`

## Alterações obrigatórias

1. Renomear semanticamente o funding público atual

Sugestão:

- manter opcode atual, mas expor como `DepositCampaignBudgetPublic`

2. Adicionar nova instrução

- `FinalizePrivateCampaignFunding`

3. Expandir `CampaignState`

Adicionar:

- `accounted_vault_balance_atomic: u64`
- `funding_mode: u8` ou enum equivalente

4. Ajustar serialização

- atualizar `CampaignState::LEN`
- atualizar `pack`
- atualizar `unpack`

5. Regras da nova instrução

- verificar que o vault ATA corresponde ao campaign PDA
- ler saldo SPL real do vault
- calcular delta versus `accounted_vault_balance_atomic`
- rejeitar delta zero ou negativo
- somar delta em `budget_total` e `budget_available`
- atualizar `accounted_vault_balance_atomic`

6. Segurança

- impedir dupla contabilização
- impedir sync em vault incorreto
- impedir corrupção de estado se o saldo diminuir após settlements

## Regra de accounting recomendada

Considere:

- `accounted_vault_balance_atomic` = total histórico de saldo já reconhecido como funding
- `budget_total` = funding total reconhecido
- `budget_spent` = total liquidado
- `budget_available` = `budget_total - budget_spent`

Isso é melhor do que confiar apenas no saldo atual do ATA, porque o saldo do ATA varia quando settlements acontecem.

## Mudanças necessárias no frontend

## Tela de criação

Arquivo:

- `frontend/components/app/new-campaign-screen.tsx`

Adicionar seleção de modo:

- `Público`
- `Privado com Cloak`

Persistir em:

- `frontend/lib/campaign-types.ts`
- `frontend/lib/api/campaigns.ts`

## Tela de detalhe

Arquivo:

- `frontend/components/app/app-campaign-detail-screen.tsx`

Hoje `handleActivateCampaign()` faz:

1. initialize
2. funding público
3. confirm

Na arquitetura final privada, ele deve fazer:

1. initialize campaign
2. verificar/register viewing key Cloak
3. depositar no Cloak
4. fazer withdraw privado para o `vault_usdc_ata` da campanha
5. chamar `private-finalize/prepare`
6. assinar/enviar a tx de finalização on-chain
7. chamar `private-finalize/confirm`

## Integração Cloak no frontend

Usar `@cloak.dev/sdk` para:

- `generateUtxoKeypair`
- `getNkFromUtxoPrivateKey`
- `transact`
- `fullWithdraw` ou `partialWithdraw`
- `scanTransactions`

Além disso, o frontend precisa tratar:

- viewing key registration
- persistência local segura do material Cloak
- retry de root/stale state
- acompanhamento das txs Cloak e da finalização Bido

## Cliente API e hooks

Arquivos:

- `frontend/lib/api/campaigns.ts`
- `frontend/lib/hooks/use-campaigns.ts`

Adicionar métodos para:

- `confirmPrivacyDeposit`
- `confirmPrivacyWithdraw`
- `preparePrivateFinalization`
- `confirmPrivateFinalization`

## Fluxo final ponta a ponta

1. sponsor cria campanha no backend
2. sponsor escolhe `privacyMode = private_cloak`
3. backend cria campanha em estado off-chain
4. sponsor inicializa a campanha on-chain
5. frontend registra viewing key Cloak
6. frontend deposita fundos no Cloak
7. frontend faz withdraw privado para o vault da campanha
8. backend registra `cloakWithdrawTxHash`
9. backend prepara a instrução `FinalizePrivateCampaignFunding`
10. frontend assina/envia a tx de finalização
11. backend confirma tx e ativa campanha

## Arquivos que precisam mudar

## Backend

- `backend/prisma/schema.prisma`
- `backend/src/campaigns/dto/create-campaign.dto.ts`
- `backend/src/campaigns/campaigns.service.ts`
- `backend/src/campaigns/campaigns.controller.ts`
- `backend/src/campaigns/campaign-funding.service.ts`
- `backend/src/cloak/*`

## Frontend

- `frontend/lib/campaign-types.ts`
- `frontend/components/app/new-campaign-screen.tsx`
- `frontend/lib/api/campaigns.ts`
- `frontend/lib/hooks/use-campaigns.ts`
- `frontend/components/app/app-campaign-detail-screen.tsx`

## Program

- `programs-sol/bido-campaign-program/src/lib.rs`
- `backend/src/campaigns/solana-program.ts`

## Regras de produto e segurança

## Custódia

Modelo recomendado:

- non-custodial para Cloak
- backend não guarda spend authority nem viewing key privada

## Observabilidade

Persistir sempre:

- `cloakDepositTxHash`
- `cloakWithdrawTxHash`
- `finalizationTxHash`
- estados intermediários
- mensagens de erro operacionais

## Compliance

Viewing key registration deve ser parte explícita do fluxo e do suporte operacional.

## Critérios de aceite

- campanhas privadas não fazem funding público sponsor -> vault
- withdraw Cloak pode ir direto para o vault da campanha
- o programa Bido consegue transformar esse saldo em orçamento oficial
- `CampaignState` permanece consistente após funding e settlements
- frontend mostra fluxo privado completo
- backend reconcilia depósito, withdraw e finalização

## Conclusão

A arquitetura final recomendada é:

- Cloak no frontend para funding privado
- withdraw direto para o vault da campanha
- nova instrução no `bido-campaign-program` para contabilizar esse saldo privado no `CampaignState`