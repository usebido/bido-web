# Bido

Bido turns AI agents into monetized decision agents. On each relevant user turn, Bido detects sponsorable intent, matches the request against eligible campaigns, runs a first-price auction, injects the winning sponsor into the agent's internal recommendation context, and settles the winning bid on Solana in USDC.

The current system supports three core verticals in the agent contract:

- `travel`
- `health`
- `ecommerce`

The payout model is enforced on-chain:

- `95%` of each winning bid goes to the agent owner wallet
- `5%` goes to Bido

This `frontend/` app is the sponsor-facing surface for the full stack: landing pages, docs, and the authenticated dashboard where advertisers create campaigns, fund them, and monitor performance.

## What Bido is building

Bido is building the monetization layer for AI-native commerce.

Instead of monetizing clicks, slots, or search-result positions, Bido monetizes the decision moment itself. When a user asks an agent for a product, trip, service, or recommendation, Bido lets sponsors compete to be the most relevant commercial option inside that decision flow without degrading the agent UX.

The system has five moving parts:

1. An agent installs the Bido skill.
2. The skill calls the intent detector on each user turn.
3. If the turn is sponsorable, the backend matches it against eligible campaigns and selects a winner.
4. The agent receives internal sponsor context before generating the final answer.
5. The winning bid settles on Solana in USDC, splitting `95% / 5%` on-chain.

## High-level architecture

```text
                     user asks agent for help
                                |
                                v
        +--------------------------------------------------+
        | AI agent with bido-sponsored-intent installed    |
        | Claude Code / Codex / OpenClaw / other agents    |
        +------------------------+-------------------------+
                                 |
                                 | POST /detect-intent
                                 v
        +--------------------------------------------------+
        | detect-intent                                     |
        | Python + FastAPI + Groq                           |
        | returns sponsorable? vertical? entities?          |
        +------------------------+-------------------------+
                                 |
                                 | POST /api/intent/match
                                 v
        +--------------------------------------------------+
        | backend                                           |
        | NestJS + Prisma + Postgres + Privy                |
        | filters campaigns, scores relevance,              |
        | runs first-price auction, returns winner          |
        +------------------------+-------------------------+
                                 |
                                 | settlement
                                 v
        +--------------------------------------------------+
        | programs-sol                                      |
        | Solana program holds campaign budgets in USDC     |
        | and settles 95% agent / 5% Bido                  |
        +------------------------+-------------------------+
                                 ^
                                 |
        +--------------------------------------------------+
        | frontend                                          |
        | sponsor dashboard, docs, campaign creation,       |
        | Cloak private funding flow                        |
        +--------------------------------------------------+
```

## Private funding architecture with Cloak

One of Bido's core product decisions is private campaign funding.

Without privacy, a competitor can inspect the chain and infer:

- which sponsor funded which campaign
- when budget was added
- how aggressively a brand is spending
- which categories a brand is prioritizing

That makes AI-agent advertising economically weak for real brands. Bido uses Cloak to remove the direct on-chain link between sponsor identity and campaign vault funding.

### Current funding flow

```text
Sponsor wallet
  -> shield into Cloak pool
  -> unshield to fresh ephemeral wallet
  -> SPL transfer to Bido campaign vault
  -> finalize private funding in program
```

### Why the ephemeral wallet exists

Cloak cannot withdraw directly to a PDA-owned token account. The system therefore creates a fresh on-curve ephemeral wallet in the browser, uses it as the withdrawal recipient, and then performs the last hop into the campaign vault.

That gives Bido two properties at once:

- campaign budgets still live in the program-owned vault
- the chain no longer exposes a direct `sponsor -> vault` funding path

### Where Kora fits

The ephemeral wallet should not need preloaded SOL, because funding it with SOL would itself leak a new on-chain link. Bido uses Kora as a paymaster so the final transfer and funding-finalization transaction can be sent without requiring the sponsor to pre-fund the ephemeral wallet with gas.

## Public repositories in the Bido stack

Bido is split across multiple public repos plus this sponsor-facing frontend.

### 1. `skills`

GitHub: https://github.com/usebido/skills

This repo contains the installable agent contract for Bido.

It currently ships `bido-sponsored-intent`, which tells the agent runtime to:

- inspect each user turn
- call `detect-intent`
- stop immediately if `sponsorable=false`
- call the Bido matcher if `sponsorable=true`
- inject the winning sponsor as internal recommendation context before the final answer

This is the distribution point for `npx skills add usebido/skills -a <agent>`.

### 2. `detect-intent`

GitHub: https://github.com/usebido/detect-intent

This is Bido's stateless sponsorable-intent classifier.

It is a Python service built around FastAPI and Groq. Its job is to classify whether a user message is a monetizable decision moment and return structured intent data such as:

- `vertical`
- `intent_type`
- `purchase_stage`
- `urgency`
- extracted entities like origin, destination, dates, and budget signals

If it returns `sponsorable=false`, the monetization pipeline stops and the agent answers normally.

### 3. `programs-sol`

GitHub: https://github.com/usebido/programs-sol

This repo contains the on-chain settlement layer.

The Solana campaign program is responsible for:

- initializing campaign accounts
- holding campaign budgets in USDC vaults
- accepting public or private funding flows
- settling winning bids on-chain
- enforcing the `95% agent / 5% Bido` split

It also contains Bido's Kora configuration for gas sponsorship.

### 4. `backend`

GitHub: https://github.com/usebido/backend

This is the control plane of the system.

The backend handles:

- sponsor authentication with Privy
- campaign CRUD
- eligibility filtering
- first-price auction selection
- analytics
- settlement orchestration
- Cloak private-funding state and confirmation flows

The public matcher contract used by the skill is `POST /api/intent/match`.

### 5. `frontend`

This repository folder, `frontend/`, is the sponsor-facing application surface.

It contains:

- marketing pages
- developer docs
- sponsor onboarding
- authenticated campaign dashboard
- campaign creation and editing
- budget and analytics views
- Cloak private-funding UX

## Why this architecture matters

Bido is not just an ad server attached to an agent. It is a full stack that coordinates:

- user-intent understanding
- sponsor eligibility
- auction-based monetization
- privacy-preserving funding
- deterministic on-chain settlement

The key product thesis is that agent monetization only works at scale if all of the following are true at the same time:

- the base answer quality stays intact
- the monetization trigger is intent-aware, not generic display inventory
- the agent owner gets paid automatically
- sponsors can fund campaigns without exposing their full market strategy on-chain

## What this frontend includes

This Next.js app is the operational shell for the whole product.

Core areas:

- public site for explaining the Bido model
- docs for agent install and integration
- sponsor app for campaign management
- private Cloak funding flow
- analytics and campaign performance views

Current stack:

- `Next.js 16`
- `React 19`
- `Tailwind CSS 4`
- `shadcn/ui`
- `Privy`
- `@cloak.dev/sdk` and `@cloak.dev/sdk-devnet`
- `@solana/kora`

## End-to-end user turn lifecycle

1. A user asks an agent for a decision-oriented recommendation.
2. The installed Bido skill sends the raw message to `detect-intent`.
3. If the result is not sponsorable, the flow stops there.
4. If the result is sponsorable, the skill posts the detector payload plus `SOLANA_AGENT_WALLET` to the backend matcher.
5. The backend filters eligible campaigns and runs a first-price auction.
6. The winning campaign is returned as `selected_candidate`.
7. The agent uses that sponsor as internal context before generating the final answer.
8. The backend settles the winning bid on Solana.
9. The program transfers `95%` to the agent owner wallet and `5%` to Bido.

## Submission framing

This README is written as a submission-oriented overview rather than a local setup guide because the important story is the system design:

- agent-native monetization instead of web-native ads
- on-chain settlement instead of black-box attribution
- private campaign funding instead of publicly leaking sponsor strategy
- installable agent runtime via `skills`
- full-stack execution from intent detection to payout

Using Colosseum Copilot as a writing aid, the strongest Solana submissions tend to present a sharp problem statement, concrete infra primitives, and explicit system boundaries rather than generic marketplace language. This README follows that framing.

That sentence is an inference from Copilot winner-pattern data, not a claim about Bido itself.

## Related links

- Skills: https://github.com/usebido/skills
- Intent detector: https://github.com/usebido/detect-intent
- Solana programs: https://github.com/usebido/programs-sol
- Backend: https://github.com/usebido/backend
- Main site: https://usebido.com
- Intent API: https://api-intent.usebido.com/detect-intent
- Backend API: https://api.usebido.com
