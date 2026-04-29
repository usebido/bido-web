# BIDO App

MVP do painel de campanhas da BIDO para anúncios em respostas de IA.

O app foi estruturado para um fluxo simples:
- criar campanha
- visualizar performance consolidada
- abrir uma campanha específica
- editar, pausar e remover campanhas

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn-style project structure
- Radix UI
- Recharts

O projeto já está configurado com:
- componentes UI em `components/ui`
- CSS global em `app/globals.css`
- aliases em `components.json`

## Rodando localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Estrutura do app

### Rotas principais

- `app/app/page.tsx`
  overview do produto
- `app/app/campaigns/page.tsx`
  tabela de campanhas
- `app/app/campaigns/new/page.tsx`
  criação de campanha
- `app/app/campaigns/[campaignId]/page.tsx`
  detalhe da campanha
- `app/app/campaigns/[campaignId]/edit/page.tsx`
  edição da campanha

### Layout autenticado

O shell principal do app fica em:
- `components/app/app-dashboard-layout.tsx`

Ele controla:
- header com `BIDO`
- sidebar
- navegação entre `Visão geral` e `Campanhas`
- CTA de `Nova campanha`

## Fluxos do MVP

### 1. Visão geral

Arquivo principal:
- `components/app/app-overview-screen.tsx`

Objetivo:
- mostrar um panorama consolidado de todas as campanhas

O overview usa dados agregados de todas as campanhas disponíveis no store local do app.

Métricas atuais:
- `CTD`
- `Spend`
- `Custo por Decisão`
- `Win Rate no Leilão`

Observação importante:
- como é um MVP, o overview prioriza comparações e snapshots atuais por campanha, não análises históricas profundas

### 2. Lista de campanhas

Arquivo principal:
- `components/app/app-campaigns-screen.tsx`

Tabela com:
- campanha
- categoria
- budget
- gasto
- CTD
- data de atualização

Componente de tabela:
- `components/ui/table.tsx`

### 3. Criar campanha

Arquivo principal:
- `components/app/new-campaign-screen.tsx`

Seções do formulário:

#### Sua Oferta

- `Nome da Marca / Produto`
- `Oferta que deseja aparecer`
- `URL de Destino`

Arquivos:
- `components/campaign/ad-info-section.tsx`

#### Onde Quer Aparecer?

- `Categoria de Intenção`

Arquivos:
- `components/campaign/targeting-section.tsx`

Categorias atuais:
- Viagens
- E-commerce
- SaaS
- Finanças
- Educação

#### Orçamento & Lances

- `Orçamento Total`
- `Lance Máximo por Recomendação`

Arquivos:
- `components/campaign/budget-section.tsx`

#### Preview lateral

Arquivo:
- `components/campaign/ad-preview.tsx`

### 4. Editar campanha

A edição reaproveita exatamente o mesmo formulário da criação.

Arquivos:
- `components/app/edit-campaign-screen.tsx`
- `components/app/new-campaign-screen.tsx`

Comportamento:
- `Editar` no detalhe da campanha abre o form preenchido
- ao salvar, o app volta para a página da campanha

### 5. Pausar e remover campanha

No detalhe da campanha existe um menu de ações:
- `Editar`
- `Pausar` ou `Retomar`
- `Remover`

Arquivos:
- `components/ui/dropdown-menu.tsx`
- `components/ui/confirm-dialog.tsx`

Comportamento:
- `Pausar` abre confirmação e alterna status entre `Ativa` e `Pausada`
- `Remover` abre confirmação e exclui a campanha do store local

## Store de campanhas

Arquivo:
- `lib/campaign-store.ts`

Hoje o app usa um store local no navegador com `localStorage`.

Ele é responsável por:
- ler campanhas
- salvar edições
- pausar/retomar
- remover
- manter lista, detalhe e overview sincronizados

Chave usada:
- `bido-campaigns`

Os dados iniciais mockados ficam em:
- `lib/app-campaign-data.ts`

## Métricas usadas no app

### CTD

Taxa de decisão associada à campanha.

### CDR (Decision Rate)

Taxa de decisão exibida no bloco de `Campaign Performance`.

### Loser Rate

Calculado como:

```text
100 - Win Rate
```

### Win Rate

Percentual de vitórias no leilão.

### Custo por Decisão

Valor médio por decisão associada à campanha.

### Spend

Valor já gasto dentro do orçamento da campanha.

## Componentes de gráfico

### Overview

Arquivos:
- `components/dashboard/metric-chart.tsx`
- `components/dashboard/mini-stat-chart.tsx`

Uso:
- panorama consolidado das campanhas

### Detalhe da campanha

Arquivo:
- `components/app/app-campaign-detail-screen.tsx`

Uso:
- bloco `Campaign Performance`

Infra base de chart:
- `components/ui/area-charts-2.tsx`

## UI components relevantes

- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/select.tsx`
- `components/ui/dropdown-menu.tsx`
- `components/ui/confirm-dialog.tsx`
- `components/ui/table.tsx`

## Estado atual do MVP

O que já está funcionando:
- dashboard autenticado
- sidebar
- overview consolidado
- tabela de campanhas
- criação de campanha
- edição de campanha
- pausar/retomar campanha
- remover campanha
- atualização local imediata entre telas

O que ainda é simplificado:
- dados ainda são mockados na origem
- persistência é local no navegador
- não existe backend real para campanhas
- parte dos gráficos ainda usa séries sintéticas leves para visualização de MVP

## Convenções úteis

- componentes visuais compartilhados ficam em `components/ui`
- telas do app ficam em `components/app`
- lógica e dados ficam em `lib`
- estilos globais ficam em `app/globals.css`

## Comandos úteis

```bash
npm run dev
npm run lint
```
