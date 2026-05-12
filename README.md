# Bido

> **Colosseum submission note:** this repo (`bido-web`) is the sponsor-facing frontend. The full Bido stack is split across multiple public repos. Use the shortcuts below to jump to each one.

## Repositories

| Repo | What it is | Link |
| --- | --- | --- |
| `bido-web` (this repo) | Sponsor-facing Next.js app: landing, docs, dashboard, funding UX | you are here |
| `skills` | Installable agent contract (`bido-sponsored-intent`) distributed via `npx skills add usebido/skills` | https://github.com/usebido/skills |
| `detect-intent` | Stateless sponsorable-intent classifier (Python + FastAPI + Groq) | https://github.com/usebido/detect-intent |
| `backend` | Control plane: auth, campaigns, eligibility, auction, settlement (NestJS + Prisma + Postgres + Privy) | https://github.com/usebido/backend |
| `programs-sol` | On-chain settlement layer: Solana campaign program + Kora paymaster config | https://github.com/usebido/programs-sol |

**Live surfaces**

- Main site: https://usebido.com
- Intent API: https://api-intent.usebido.com/detect-intent
- Backend API: https://api.usebido.com

---

## About this repo

`bido-web` is the sponsor-facing surface of Bido — the monetization layer for AI-native commerce. Bido lets sponsors compete to be the most relevant commercial option inside an AI agent's recommendation flow, with settlement happening on Solana in USDC.

This frontend is where sponsors come to **understand the product, sign up, launch campaigns, fund them, and watch them perform**. Everything an advertiser does with Bido happens here.

## What this app does

`bido-web` covers four jobs end to end:

- **Tell the story.** A public marketing site that explains the Bido model, the verticals it supports (`travel`, `health`, `ecommerce`), and the agent-side install flow.
- **Onboard sponsors.** Wallet-based authentication, account setup, and a guided first-campaign flow so a new sponsor can go from signup to live campaign without friction.
- **Run campaigns.** A full campaign dashboard: creation, editing, targeting, bidding strategy, budget management, pause/resume, and lifecycle controls.
- **Show what's working.** Performance views with spend, win rate, impressions, and per-campaign analytics so sponsors can see how their budget is actually being spent inside agent conversations.

It also includes developer docs for agents that want to install the Bido skill and integrate with the intent + matcher APIs.

## Stack

- `Next.js 16` (App Router)
- `React 19`
- `Tailwind CSS 4` + `shadcn/ui`
- `Privy` for wallet-based auth
- Solana wallet + USDC funding flows
- Talks to the Bido `backend` API for everything campaign-related

## How it fits the rest of the stack

`bido-web` is the only surface a sponsor actually sees. Under the hood it talks to the `backend`, which orchestrates auctions, eligibility, and settlement against the `programs-sol` on-chain program. The `skills` and `detect-intent` repos handle the agent side and never touch this app directly.

In short: agents bring the demand, the backend and programs run the auction and the payout, and `bido-web` is the room where sponsors decide what they want to buy.
