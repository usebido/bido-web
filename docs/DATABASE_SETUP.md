# Database setup

The Bido schema lives in [supabase/migrations/](../supabase/migrations/). Migrations are plain SQL and idempotent — running them twice should not error.

## Applying the initial migration

1. Open the Supabase project → **SQL Editor** → **New query**.
2. Paste the contents of [supabase/migrations/001_initial_schema.sql](../supabase/migrations/001_initial_schema.sql).
3. Click **Run**. You should see `Success. No rows returned.`

### Alternative: Supabase CLI

If you have the [Supabase CLI](https://supabase.com/docs/guides/cli) linked to this project:

```bash
supabase db push
```

## Verifying it worked

In the SQL Editor:

```sql
-- All five tables exist
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
-- expected: auctions, campaigns, decisions, sponsors, wrappers

-- RLS is enabled on every table
select relname, relrowsecurity
from pg_class
where relname in ('sponsors','campaigns','auctions','decisions','wrappers');
-- relrowsecurity should be true for all five

-- Policies are in place
select tablename, policyname
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

Or via the UI: **Table Editor** → you should see the five tables, each with an RLS badge.

## Resetting the database

Drops everything this migration created, in dependency order. Run in the SQL Editor when you need a clean slate:

```sql
BEGIN;

DROP TABLE IF EXISTS decisions CASCADE;
DROP TABLE IF EXISTS auctions  CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS sponsors  CASCADE;
DROP TABLE IF EXISTS wrappers  CASCADE;

DROP FUNCTION IF EXISTS handle_updated_at();

COMMIT;
```

Then re-run `001_initial_schema.sql`.

## Regenerating TypeScript types

After the schema is live, regenerate [lib/supabase/types.ts](../lib/supabase/types.ts):

```bash
npx supabase gen types typescript --project-id <PROJECT_ID> > lib/supabase/types.ts
```

The `<PROJECT_ID>` is the subdomain of your `NEXT_PUBLIC_SUPABASE_URL` (e.g. `srsitzjxvilnrwmctdkh`).
