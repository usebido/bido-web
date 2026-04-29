# Backend Plan For `app/app`

## Goal

Build a backend that supports:

- authenticated sponsor accounts
- create, edit, pause, resume, and delete campaigns
- campaign list and campaign detail pages
- dashboard metrics and charts

## Frontend Features That Need Backend Support

From `app/app` and `components/app`, the UI currently expects:

- dashboard overview with aggregated campaign metrics
- campaign list
- campaign detail page
- new campaign form
- edit campaign form
- pause/resume campaign action
- delete campaign action

## Recommended Backend Modules

Split the backend into these areas:

1. `auth`
2. `users`
3. `campaigns`
4. `campaign-analytics`

## Auth

The frontend already uses Privy in places outside the campaign store. The backend should trust Privy authentication and map each authenticated wallet/user to an internal account.

You need:

- verify Privy access token or session token on each protected request
- create or upsert a local `user`
- support one sponsor owning many campaigns

https://docs.privy.io/authentication/user-authentication/tokens (using the website for get tokens)

Minimum user fields:

## Campaign Data Model

The current frontend uses two shapes:

- `CampaignFormData` for create/edit form input
- `CampaignRecord` for list/detail/dashboard rendering

### Form input currently required by UI

```ts
type CampaignFormData = {
  brandName: string;
  offerText: string;
  destinationUrl: string;
  location: string;
  intentCategory: string;
  totalBudget: number;
  queryBid: number;
};
```

### Recommended database model

Use a normalized campaign entity and compute analytics separately:

```ts
type Campaign = {
  id: string;
  userId: string;
  name: string;
  advertiserName: string;
  status: "draft" | "in_review" | "active" | "paused" | "archived";
  objective: "acquisition" | "monetization";
  destinationUrl: string;
  summary: string;
  geo: string;
  intentCategory: string;
  monthlyBudgetUsd: number;
  maxBidPerDecisionUsd: number;
  audienceDescription?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
};
```

### Separate analytics model

Do not store every chart number directly inside `campaigns`.

Use separate tables or collections for rollups:

```ts
type CampaignDailyMetrics = {
  id: string;
  campaignId: string;
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  recommendations: number;
  influencedDecisions: number;
  spendUsd: number;
  winRate: number;
  ctd: number;
  costPerDecisionUsd: number;
};
```

### Why this matters

The current `CampaignRecord` is frontend-friendly but backend-hostile because it mixes:

- campaign identity
- mutable campaign config
- cached aggregates
- chart series

Keep those concerns separate in the backend.

## API Surface

### 1. Auth / Current user

`GET /api/me`

Returns the authenticated sponsor account:

```json
{
  "id": "usr_123",
  "privyUserId": "did:privy:...",
  "walletAddress": "48vdX..."
}
```

### 2. Campaigns

`GET /api/campaigns`

- list campaigns for current user
- support filters by status, category, date

`POST /api/campaigns`

- create a new campaign from `CampaignFormData`

Suggested request body:

```json
{
  "brandName": "Bido Flights",
  "offerText": "Promo fares for GRU to JFK",
  "destinationUrl": "https://usebido.com",
  "location": "Brazil",
  "intentCategory": "viagens",
  "totalBudget": 1000,
  "queryBid": 0.5
}
```

`GET /api/campaigns/:campaignId`

- return one campaign plus summary analytics for detail page

`PATCH /api/campaigns/:campaignId`

- update editable campaign fields

`POST /api/campaigns/:campaignId/pause`

- set status to `paused`

`POST /api/campaigns/:campaignId/resume`

- set status to `active`

`DELETE /api/campaigns/:campaignId`

- soft delete preferred

### 3. Campaign analytics

`GET /api/campaigns/summary`

- totals for overview page
- budget, spend, impressions, clicks, conversions, avg win rate, avg CPD

`GET /api/campaigns/:campaignId/analytics?period=7d|30d|90d`

- returns chart points used by `AppCampaignDetailScreen`

Suggested response:

```json
{
  "topMetrics": {
    "ctd": 14.2,
    "winRate": 31,
    "loserRate": 69,
    "costPerDecisionUsd": 0.38
  },
  "series": [
    {
      "period": "Week 1",
      "spend": 180,
      "winRate": 28,
      "cdr": 12.1,
      "loserRate": 72,
      "decisionCost": 0.41
    }
  ]
}
```
