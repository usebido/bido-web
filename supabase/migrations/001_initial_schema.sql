-- =====================================================================
-- Bido — Initial schema
-- Creates the 5 core tables (sponsors, campaigns, auctions, decisions,
-- wrappers), updated_at triggers and Row Level Security policies.
-- Idempotent: safe to run multiple times.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- PART 1 — Extensions
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- PART 2 — Tables
-- ---------------------------------------------------------------------

-- sponsors: companies that fund campaigns and log in via Privy.
CREATE TABLE IF NOT EXISTS sponsors (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    privy_id        text UNIQUE NOT NULL,
    email           text,
    name            text,
    wallet_address  text,
    balance         numeric(18,6) NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sponsors_privy_id_idx ON sponsors (privy_id);

COMMENT ON TABLE sponsors IS 'Advertisers/sponsors that fund campaigns. Identified by their Privy id.';
COMMENT ON COLUMN sponsors.privy_id IS 'Privy user DID (sub claim of the Privy JWT).';
COMMENT ON COLUMN sponsors.balance IS 'USDC balance available to bid, in units of USDC.';

-- campaigns: bid configurations owned by a sponsor.
CREATE TABLE IF NOT EXISTS campaigns (
    id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    sponsor_id     uuid NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
    name           text NOT NULL,
    category       text NOT NULL,
    target_queries text[] NOT NULL DEFAULT '{}',
    offer_text     text NOT NULL,
    max_cpd        numeric(10,4) NOT NULL,
    daily_budget   numeric(10,2) NOT NULL,
    status         text NOT NULL DEFAULT 'active'
                   CHECK (status IN ('active','paused','finished')),
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS campaigns_sponsor_id_idx ON campaigns (sponsor_id);
CREATE INDEX IF NOT EXISTS campaigns_category_idx   ON campaigns (category);
CREATE INDEX IF NOT EXISTS campaigns_status_idx     ON campaigns (status);

COMMENT ON TABLE campaigns IS 'Bidding campaigns owned by a sponsor. Compete in per-query auctions.';
COMMENT ON COLUMN campaigns.target_queries IS 'Queries this campaign is eligible for (free-form text array).';
COMMENT ON COLUMN campaigns.offer_text IS 'Text that will be inserted into the LLM response if this campaign wins.';
COMMENT ON COLUMN campaigns.max_cpd IS 'Maximum cost per decision (CPD) the sponsor is willing to pay.';
COMMENT ON COLUMN campaigns.daily_budget IS 'Daily spend cap in USDC.';

-- auctions: one per LLM wrapper query; records participants + winner.
CREATE TABLE IF NOT EXISTS auctions (
    id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    query               text NOT NULL,
    query_category      text,
    wrapper_id          uuid,
    winner_campaign_id  uuid REFERENCES campaigns(id) ON DELETE SET NULL,
    winning_cpd         numeric(10,4),
    participants        jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auctions_winner_campaign_id_idx ON auctions (winner_campaign_id);
CREATE INDEX IF NOT EXISTS auctions_created_at_idx         ON auctions (created_at);

COMMENT ON TABLE auctions IS 'One auction per query received from an LLM wrapper.';
COMMENT ON COLUMN auctions.participants IS 'Snapshot of the campaigns that entered this auction and their bids.';

-- decisions: the user-facing event — one per auction shown to an end user.
CREATE TABLE IF NOT EXISTS decisions (
    id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id uuid NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    shown_at   timestamptz NOT NULL DEFAULT now(),
    clicked    boolean NOT NULL DEFAULT false,
    converted  boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS decisions_auction_id_idx ON decisions (auction_id);

COMMENT ON TABLE decisions IS 'Records each impression of the auction winner and downstream click/conversion.';

-- wrappers: LLM-wrapper partners that send queries into Bido.
CREATE TABLE IF NOT EXISTS wrappers (
    id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name           text NOT NULL,
    api_key        text UNIQUE NOT NULL,
    wallet_address text,
    revenue_share  numeric(3,2) NOT NULL DEFAULT 0.80,
    created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wrappers_api_key_idx ON wrappers (api_key);

COMMENT ON TABLE wrappers IS 'Registered LLM-wrapper partners that submit queries and earn revenue share.';
COMMENT ON COLUMN wrappers.revenue_share IS 'Fraction of the winning CPD paid to the wrapper (0.00 to 1.00).';

-- ---------------------------------------------------------------------
-- PART 3 — updated_at trigger
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sponsors_set_updated_at ON sponsors;
CREATE TRIGGER sponsors_set_updated_at
    BEFORE UPDATE ON sponsors
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS campaigns_set_updated_at ON campaigns;
CREATE TRIGGER campaigns_set_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ---------------------------------------------------------------------
-- PART 4 — Row Level Security
-- ---------------------------------------------------------------------

ALTER TABLE sponsors  ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrappers  ENABLE ROW LEVEL SECURITY;

-- ---- sponsors policies ----------------------------------------------
DROP POLICY IF EXISTS sponsors_select_own ON sponsors;
CREATE POLICY sponsors_select_own ON sponsors
    FOR SELECT
    USING (privy_id = auth.jwt() ->> 'sub');

DROP POLICY IF EXISTS sponsors_insert_authenticated ON sponsors;
CREATE POLICY sponsors_insert_authenticated ON sponsors
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'sub' IS NOT NULL);

DROP POLICY IF EXISTS sponsors_update_own ON sponsors;
CREATE POLICY sponsors_update_own ON sponsors
    FOR UPDATE
    USING (privy_id = auth.jwt() ->> 'sub')
    WITH CHECK (privy_id = auth.jwt() ->> 'sub');

-- ---- campaigns policies ---------------------------------------------
DROP POLICY IF EXISTS campaigns_select_own ON campaigns;
CREATE POLICY campaigns_select_own ON campaigns
    FOR SELECT
    USING (
        sponsor_id = (SELECT id FROM sponsors WHERE privy_id = auth.jwt() ->> 'sub')
    );

DROP POLICY IF EXISTS campaigns_insert_own ON campaigns;
CREATE POLICY campaigns_insert_own ON campaigns
    FOR INSERT
    WITH CHECK (
        sponsor_id = (SELECT id FROM sponsors WHERE privy_id = auth.jwt() ->> 'sub')
    );

DROP POLICY IF EXISTS campaigns_update_own ON campaigns;
CREATE POLICY campaigns_update_own ON campaigns
    FOR UPDATE
    USING (
        sponsor_id = (SELECT id FROM sponsors WHERE privy_id = auth.jwt() ->> 'sub')
    )
    WITH CHECK (
        sponsor_id = (SELECT id FROM sponsors WHERE privy_id = auth.jwt() ->> 'sub')
    );

DROP POLICY IF EXISTS campaigns_delete_own ON campaigns;
CREATE POLICY campaigns_delete_own ON campaigns
    FOR DELETE
    USING (
        sponsor_id = (SELECT id FROM sponsors WHERE privy_id = auth.jwt() ->> 'sub')
    );

-- ---- auctions / decisions / wrappers — deny all to non-service-role --
-- The service_role key bypasses RLS, so backend code still has full access.
-- A restrictive policy makes the intent explicit.

DROP POLICY IF EXISTS auctions_deny_all ON auctions;
CREATE POLICY auctions_deny_all ON auctions
    FOR ALL
    USING (false)
    WITH CHECK (false);

DROP POLICY IF EXISTS decisions_deny_all ON decisions;
CREATE POLICY decisions_deny_all ON decisions
    FOR ALL
    USING (false)
    WITH CHECK (false);

DROP POLICY IF EXISTS wrappers_deny_all ON wrappers;
CREATE POLICY wrappers_deny_all ON wrappers
    FOR ALL
    USING (false)
    WITH CHECK (false);

COMMIT;
