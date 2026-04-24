# Auth flow — Privy ↔ Supabase handshake

## Why two tokens?

Privy owns identity (wallet + email login). Supabase owns the database and enforces Row Level Security. Supabase's RLS policies read `auth.jwt() ->> 'sub'` to identify the caller — but that JWT must be signed with the Supabase project's own `JWT_SECRET`. Privy signs its tokens with its own RSA keys, so Supabase won't accept them directly.

We bridge the two:

1. Frontend logs in with Privy → gets a Privy access token (RS256, signed by Privy).
2. Frontend `POST`s that token to [/api/auth/supabase-token](../app/api/auth/supabase-token/route.ts).
3. Backend verifies the Privy token against Privy's JWKS ([lib/privy/verify.ts](../lib/privy/verify.ts)).
4. Backend mints a Supabase-signed JWT (HS256, `SUPABASE_JWT_SECRET`) with the same `sub` = Privy DID ([lib/supabase/jwt.ts](../lib/supabase/jwt.ts)).
5. Frontend stores that JWT via `supabase.auth.setSession` — now browser queries carry it and hit RLS as the right user.

```
  Privy SDK ──access_token──▶ /api/auth/supabase-token ──▶ verifyPrivyToken
                                            │
                                            ▼
                                     createSupabaseJwt
                                            │
                                            ▼
                              { supabaseToken }  ──▶  supabase.auth.setSession
```

The Supabase JWT contains:

| claim          | value                                  |
|----------------|----------------------------------------|
| `sub`          | Privy DID (matches `sponsors.privy_id`)|
| `role`         | `authenticated`                        |
| `aud`          | `authenticated`                        |
| `iss`          | `bido-backend`                         |
| `email`        | (if Privy provided it)                 |
| `sponsor_id`   | (if a sponsor row already exists)      |
| `exp`          | now + 1h                               |

## Supabase dashboard configuration

No changes required if you're signing with the project's default `SUPABASE_JWT_SECRET` and using `role: authenticated` + `aud: authenticated`. The default GoTrue/Auth config accepts these out of the box.

If you ever rotate the JWT secret in the Supabase dashboard (Project Settings → API → JWT Settings), also update `SUPABASE_JWT_SECRET` in [.env.local](../.env.local).

## Frontend usage

Call the hook once, inside a provider near the top of the tree:

```tsx
"use client";
import { useSupabaseSession } from "@/hooks/use-supabase-session";

export function SupabaseSync({ children }: { children: React.ReactNode }) {
  useSupabaseSession();
  return <>{children}</>;
}
```

Wrap it around `<PrivyProvider>`'s children so it re-runs whenever Privy's `authenticated` flag flips.

## Testing manually

```bash
# 1. Log in to the app in the browser, then copy the Privy access token from
#    devtools (Application → Local Storage → privy:token) or via `getAccessToken()`.

PRIVY_TOKEN="eyJ..."

# 2. Exchange it
curl -X POST http://localhost:3000/api/auth/supabase-token \
  -H "Authorization: Bearer $PRIVY_TOKEN"

# → { "supabaseToken": "eyJ..." }

# 3. Hit PostgREST directly with the Supabase token
SUPABASE_URL="https://srsitzjxvilnrwmctdkh.supabase.co"
SUPABASE_ANON_KEY="..."
SUPABASE_TOKEN="eyJ..."

curl "$SUPABASE_URL/rest/v1/sponsors?select=*" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_TOKEN"
# → should return only the row where privy_id matches your DID (or [] if none yet)
```

## Sponsor sync

The JWT handshake alone doesn't create a `sponsors` row — it just mints a session. The row is created (or updated) by [/api/sponsors/sync](../app/api/sponsors/sync/route.ts), which is called by [hooks/use-sponsor-sync.ts](../hooks/use-sponsor-sync.ts) right after login.

Flow on first login:

```
Privy login ─▶ useSupabaseSession (mints Supabase JWT, setSession)
            └▶ useSponsorSync      (POST /api/sponsors/sync → INSERT sponsor)
```

On return visits the same flow runs, but `/api/sponsors/sync` finds the existing row and only patches fields the client explicitly sent (never overwrites with `undefined`). Both hooks live inside [`<SyncBridge>`](../components/providers/sync-bridge.tsx), mounted by `privy-provider.tsx`.

### Endpoints

- `POST /api/sponsors/sync` — body `{ email?, name?, walletAddress? }`. Creates or updates. Returns the sponsor row. `201` on insert, `200` on update.
- `GET  /api/sponsors/me` — returns the current user's sponsor row. `404` if it doesn't exist yet (client should call `/sync` first).

### curl

```bash
PRIVY_TOKEN="eyJ..."

# Create / update
curl -X POST http://localhost:3000/api/sponsors/sync \
  -H "Authorization: Bearer $PRIVY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Acme Travel","walletAddress":"9xQeWvG..."}'

# Read
curl http://localhost:3000/api/sponsors/me \
  -H "Authorization: Bearer $PRIVY_TOKEN"
```

## Failure modes to watch for

- **401 on `/api/auth/supabase-token`** — Privy token expired or APP_ID mismatch. Check `NEXT_PUBLIC_PRIVY_APP_ID`.
- **Empty `[]` from RLS-protected tables** — expected when no sponsor row exists yet. Call `/api/sponsors/sync` first.
- **`JWSSignatureVerificationFailed`** — `SUPABASE_JWT_SECRET` in `.env.local` doesn't match the one in the Supabase dashboard.
- **Sponsor sync says 400 "Invalid body"** — `walletAddress` must be 32–64 chars (Solana base58). Check that Privy's embedded wallet already finished provisioning; otherwise resend without the field.
- **`wallet_address` still `null` after first login** — the Solana embedded wallet can race past the first sync. The hook re-runs whenever Privy state changes; if it still doesn't populate, call `refetch()` from `useSponsorSync` after the wallet appears.
