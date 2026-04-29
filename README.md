# Bido Solana

Projeto completo da Bido com:

- front-end em `Next.js` na raiz do repositório
- back-end em `NestJS` dentro de `backend/`
- relay de transações com `Kora` em `programs/bido-campaign-program/kora/`

## Estrutura

```text
.
├─ app/                                   Front-end Next.js
├─ backend/                               API NestJS + Prisma
├─ programs/bido-campaign-program/kora/   Config local do Kora
└─ programs/bido-campaign-program/        Programa Solana
```

## Pré-requisitos

- Node.js 20+
- npm
- PostgreSQL rodando localmente ou remoto
- binário `kora` instalado e disponível no PATH

## 1. Instalar dependências

Front-end:

```bash
npm install
```

Back-end:

```bash
cd backend
npm install
```

## 2. Configurar variáveis de ambiente

### Front-end

Crie o arquivo `.env` na raiz:

```env
NEXT_PUBLIC_PRIVY_APP_ID=seu-privy-app-id
NEXT_PUBLIC_LOGIN_ENABLED=true
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_BIDO_API_BASE=http://localhost:3001/api
NEXT_PUBLIC_SOLANA_USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
NEXT_PUBLIC_KORA_RPC_URL=http://127.0.0.1:8080
```

Observações:

- `NEXT_PUBLIC_BIDO_API_BASE` é opcional no código, mas vale fixar explicitamente.
- `NEXT_PUBLIC_SOLANA_USDC_MINT` usa o mint de USDC em devnet.

### Back-end

Copie o exemplo:

```bash
cd backend
cp .env.example .env
```

Preencha ao menos:

```env
NODE_ENV=development
PORT=3001
API_PREFIX=api
CORS_ORIGINS=http://localhost:3000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bido?schema=public
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/bido?schema=public

PRIVY_APP_ID=seu-privy-app-id
PRIVY_APP_SECRET=seu-privy-app-secret

SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_CLUSTER=devnet
SOLANA_USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
SOLANA_CAMPAIGN_PROGRAM_ID=seu-program-id

KORA_RPC_URL=http://127.0.0.1:8080
```

### Kora

Crie ou ajuste o arquivo `programs/bido-campaign-program/kora/.env`:

```env
KORA_PRIVATE_KEY=sua-private-key-base58-ou-array
CONFIG=/Users/joaorubensbelluzzoneto/Documents/bido-solana/programs/bido-campaign-program/kora/kora.toml
SIGNERS=/Users/joaorubensbelluzzoneto/Documents/bido-solana/programs/bido-campaign-program/kora/signers.toml
RPC_URL=https://api.devnet.solana.com
```

O `signers.toml` usa a variável `KORA_PRIVATE_KEY` para carregar o signer em memória.

## 3. Preparar banco de dados

Com o PostgreSQL disponível:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate -- --name init
```

Se quiser popular dados iniciais:

```bash
cd backend
npm run prisma:seed
```

## 4. Subir o Kora

Opção direta:

```bash
cd programs/bido-campaign-program/kora
set -a
source .env
set +a
kora --config /Users/joaorubensbelluzzoneto/Documents/bido-solana/programs/bido-campaign-program/kora/kora.toml --rpc-url https://api.devnet.solana.com rpc start --signers-config /Users/joaorubensbelluzzoneto/Documents/bido-solana/programs/bido-campaign-program/kora/signers.toml
```

Opção via script:

```bash
cd programs/bido-campaign-program/kora
./run-kora.sh
```

Por padrão, o Kora sobe em:

```text
http://127.0.0.1:8080
```

## 5. Subir o back-end

```bash
cd backend
npm run start:dev
```

Endpoints locais:

- API: `http://localhost:3001/api`
- Swagger: `http://localhost:3001/api/docs`

## 6. Subir o front-end

Na raiz do projeto:

```bash
npm run dev
```

App local:

```text
http://localhost:3000
```

## Ordem recomendada para desenvolvimento

1. Suba o PostgreSQL
2. Rode as migrations do Prisma
3. Suba o `kora`
4. Suba o back-end
5. Suba o front-end

## Comandos úteis

Front-end:

```bash
npm run dev
npm run build
npm run lint
```

Back-end:

```bash
cd backend
npm run start:dev
npm run build
npm run lint
npm run test
```

Prisma:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:studio
npm run prisma:seed
```

## Troubleshooting

### O front-end não fala com a API

- confirme `NEXT_PUBLIC_BIDO_API_BASE=http://localhost:3001/api`
- confirme `CORS_ORIGINS=http://localhost:3000`
- confirme que o back-end está de pé na porta `3001`

### O back-end falha ao iniciar

- valide `DATABASE_URL` e `DIRECT_URL`
- rode `npm run prisma:generate`
- rode `npm run prisma:migrate -- --name init`

### O fluxo patrocinado via Kora não funciona

- confirme que o `kora` está rodando em `http://127.0.0.1:8080`
- confirme `KORA_RPC_URL` no back-end
- confirme `NEXT_PUBLIC_KORA_RPC_URL` no front-end
- confirme que `KORA_PRIVATE_KEY` está válida
- confirme `SOLANA_CAMPAIGN_PROGRAM_ID` apontando para o programa implantado
