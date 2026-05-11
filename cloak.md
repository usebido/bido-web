# Por que o Bido usa Cloak

## O contexto: ecommerce via AI Agents

No ecommerce tradicional, marcas competem por clique, impressão, posicionamento, sponsored listings e search ads. No ecommerce via AI Agents, a competição muda: agora marcas competem **para aparecer dentro da decisão do agente**.

### Exemplo de uso

O usuário pede para o agente:

> "Me encontre um notebook gamer até R$6 mil."

O agente entende a intenção, busca produtos, recebe campanhas patrocinadas elegíveis, escolhe a recomendação mais relevante e responde.

O Bido monetiza exatamente esse momento.

### Como o Bido funciona

```
Usuário → Agente → Matcher → Campanha vencedora → Agente responde
```

A marca cria uma campanha, escolhe categorias, define bid por decisão, financia um orçamento e entra no leilão de intenções.

Quando o agente detecta uma intenção compatível, o matcher seleciona a campanha vencedora combinando múltiplos sinais (bid, relevância semântica, geo, urgência, estágio de compra), executa o settlement onchain, e paga o agente pela decisão monetizada. Tudo em tempo real.

O leilão não é "quem paga mais ganha" — é uma combinação de bid e relevância. Uma campanha de notebook gamer com bid menor pode ganhar de uma campanha genérica de ecommerce com bid maior, porque a relevância semântica pesa no score.

## O problema sem Cloak

Sem uma camada de privacidade no funding, a infraestrutura financeira fica pública:

```
Sponsor Wallet → Campaign Vault → Settlement → Agent Wallet
```

Qualquer pessoa com um RPC Solana consegue indexar as transações, correlacionar wallets e reconstruir a estratégia comercial das marcas.

### O que um concorrente consegue descobrir

A Dell cria uma campanha de notebook gamer com budget $100k e bid $0.50.

Sem Cloak, o concorrente consegue ler direto da chain:

- A wallet da Dell e o link direto dela com cada campanha
- Quanto a Dell depositou e quando
- Quando a Dell aumentou ou pausou spend
- Quantas decisões por hora a campanha resolve
- Quais agentes estão convertendo o spend da Dell
- Pacing do orçamento e crescimento da campanha
- Categorias priorizadas pela Dell
- **Agregado de spend total da Dell** somando todas as campanhas dela

### O ataque competitivo direcionado

A HP roda um indexador monitorando o programa Bido onchain. Identifica a wallet da Dell, mapeia as campanhas, e monta uma estratégia de contra-campanha calibrada exatamente contra os bids e categorias da Dell.

Esse ataque depende de duas coisas: identificar a marca por trás de cada campanha, e ter dashboard em tempo real do pacing dela. As duas vêm de graça quando o funding é público.

### Inteligência competitiva gratuita

Sem Cloak, o sistema vira um dashboard público do ecommerce agregado por marca:

- Dell aumentou spend em notebook gamer X%
- Samsung cresceu em monitores Y%
- Marca W está montando campanhas antes da Black Friday

O mercado inteiro consegue prever, **por marca**, movimentação comercial, sazonalidade, foco estratégico, agressividade de pricing e crescimento por categoria.

Isso é inteligência competitiva gratuita, com nome e CNPJ.

### Griefing direcionado

Um griefer detecta "a wallet da Dell colocou $500k em notebook gamer" e cria agentes especificamente para capturar esse spend. Sem Cloak, ele sabe exatamente qual marca atacar, quando ela entrou, quanto possui no agregado e qual a estratégia dela.

## O que a Cloak entrega

A Cloak quebra o vínculo `Sponsor ↔ Campaign Vault` no nível onchain.

### O que muda no fluxo

**Antes:**

```
Dell Wallet → Campaign Vault
```

**Depois:**

```
Shielded Funding → Campaign Vault
```

O sponsor deposita USDC no pool privado da Cloak. O dinheiro é entregue ao cofre da campanha através de uma wallet intermediária efêmera que não tem histórico onchain. O link sponsor↔campanha desaparece da chain.

### O que fica privado

Com Cloak, o mercado não consegue mais descobrir:

- Qual marca está por trás de cada campanha específica
- Quais campanhas pertencem à mesma marca
- Orçamento agregado por empresa
- Histórico consolidado de uma marca
- Crescimento total de uma marca
- Correlação direta entre funding onchain e identidade do sponsor

### O que nunca esteve onchain

Importante notar: vários dados sensíveis da marca **nunca estiveram onchain**, nem antes da Cloak. O contrato Bido só registra dados operacionais (campaign_id, mint, vault, budget atomic, status). Não vão pra blockchain:

- Nome da marca (`advertiserName`)
- Descrição da campanha
- Descrição da audiência
- URL de destino
- Email ou identificação corporativa
- Categoria de produto específica (só a vertical genérica)

Esses dados moram no backend Bido, sob controle da marca, e só aparecem na resposta do matcher pro agente (o "Sponsored by Dell" que o usuário final vê — que é por design, é a contrapartida do patrocínio).

### Combinação: o que outsider consegue ver com Cloak ativo

A leitura onchain do mercado vira:

- Existem N campanhas ativas em ecommerce
- Cada uma tem bid X e saldo Y
- Cada uma resolve Z decisions por hora
- Cada settlement vai pra alguma agent wallet

E para. Sem marca. Sem agregação por sponsor. Sem timing correlation.

## A diferença prática

| Sem Cloak | Com Cloak |
|---|---|
| "A Dell tem 4 campanhas somando $400k em ecommerce." | "Existem campanhas em ecommerce." |
| "A wallet 7xK é a Dell, vamos atacar." | "Existe um vault com saldo X." |
| Inteligência competitiva por marca em tempo real. | Observação macro de mercado. |
| Pacing de cada marca medido em tempo real. | Pacing por campanha anônima. |
| Munição direcionada gratuita pro concorrente. | O concorrente compete no leilão, não no metagame. |

## Paralelo com Google Ads

No anúncio do Google você vê:

```
Sponsored by Dell
```

Mas você **não** vê:

- Spend real da Dell
- CAC
- Pacing
- Estratégia de bidding
- Crescimento da campanha
- Quantas campanhas a Dell roda em paralelo
- Budget agregado da Dell em mídia

Sem Cloak, o ecommerce via agentes quebraria essa lógica — seria Google Ads com dashboard financeiro público em tempo real, com nome e CNPJ. Nenhuma grande marca operaria assim.

Com Cloak, o Bido fica no mesmo nível de privacidade comercial que o sponsor já tem em Google Ads, **sem perder a auditabilidade onchain do settlement** (que é o que dá confiança pro agente e pro usuário final).

## O ganho final

A Cloak transforma o Bido de:

> "Planilha pública de spend de marketing por marca"

para:

> "Mercado anônimo de campanhas, com identidade da marca controlada pelo sponsor"

### O que o usuário e o agente continuam vendo

- Transparência no anúncio (`Sponsored by Dell`)
- Settlement onchain auditável
- Campanhas funcionando em tempo real
- Volume de mercado observável

### O que fica privado da concorrência

- Identidade financeira da marca por trás de cada campanha
- Agregação de spend por marca
- Crescimento consolidado da marca
- Estratégia comercial atrelada ao nome

Isso torna o ecommerce via AI Agents economicamente viável para marcas reais.
