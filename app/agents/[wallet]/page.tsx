import type { Metadata } from "next";
import Link from "next/link";
import {
  activeVerticalsList,
  basisPointsToPercent,
  explorerAccountUrl,
  explorerTxUrl,
  fetchAgentAttestations,
  fetchAgentTier,
  MILESTONE_TYPE_LABEL,
  TIER_NAMES,
  type AgentAttestationItem,
  type AgentAttestationsResponse,
  type AgentTierResponse,
} from "@/lib/api/agents";

const SOLANA_CLUSTER =
  process.env.NEXT_PUBLIC_SOLANA_CLUSTER ?? "devnet";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ wallet: string }>;
}): Promise<Metadata> {
  const { wallet } = await params;
  return {
    title: `Agent ${wallet.slice(0, 6)}… reputation | Bido`,
    description: `Verifiable reputation for agent ${wallet} — tier, payouts, and Solana Attestation Service history.`,
  };
}

export default async function AgentReputationPage({
  params,
}: {
  params: Promise<{ wallet: string }>;
}) {
  const { wallet } = await params;

  const [tier, attestations] = await Promise.all([
    fetchAgentTier(wallet).catch(() => null),
    fetchAgentAttestations(wallet).catch(() => null),
  ]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <header className="flex flex-col gap-3">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Bido Agent Reputation
          </div>
          <h1 className="break-all font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
            {wallet}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link
              href={explorerAccountUrl(wallet, SOLANA_CLUSTER)}
              target="_blank"
              rel="noreferrer"
              className="text-violet hover:underline"
            >
              View wallet on Solana Explorer ↗
            </Link>
            {tier?.attestationPda ? (
              <Link
                href={explorerAccountUrl(tier.attestationPda, SOLANA_CLUSTER)}
                target="_blank"
                rel="noreferrer"
                className="text-violet hover:underline"
              >
                Current snapshot PDA ↗
              </Link>
            ) : null}
          </div>
        </header>

        <TierSummary tier={tier} attestations={attestations} />

        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold">On-chain attestation history</h2>
          <AttestationsList attestations={attestations} />
        </section>

        <footer className="mt-16 text-xs text-muted-foreground">
          <p>
            Reputation accrues via the{" "}
            <a
              href="https://attest.solana.com"
              target="_blank"
              rel="noreferrer"
              className="text-violet hover:underline"
            >
              Solana Attestation Service
            </a>
            . Any protocol can read the PDA directly — no Bido access required.
          </p>
        </footer>
      </div>
    </main>
  );
}

function TierSummary({
  tier,
  attestations,
}: {
  tier: AgentTierResponse | null;
  attestations: AgentAttestationsResponse | null;
}) {
  const resolved = tier ?? {
    tier: 0,
    tierName: TIER_NAMES[0],
    source: "default" as const,
  };
  const totalPayouts = attestations?.totalPayouts ?? tier?.totalPayouts ?? 0;
  const rateBps =
    attestations?.considerationRate30dBps ?? tier?.considerationRate30dBps ?? 0;
  const verticalsBitmap =
    attestations?.verticalsBitmap ?? tier?.verticalsBitmap ?? 0;
  const verticals = activeVerticalsList(verticalsBitmap);
  const anomalyFlags = attestations?.anomalyFlags ?? tier?.anomalyFlags ?? 0;

  return (
    <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card label="Current tier" highlight>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold">{resolved.tier}</span>
          <span className="text-base uppercase tracking-wide text-muted-foreground">
            {resolved.tierName}
          </span>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          source: {resolved.source}
        </div>
      </Card>
      <Card label="Confirmed payouts">
        <span className="text-3xl font-bold tabular-nums">{totalPayouts}</span>
      </Card>
      <Card label="30-day consideration rate">
        <span className="text-3xl font-bold tabular-nums">
          {basisPointsToPercent(rateBps)}
        </span>
      </Card>
      <Card label="Active verticals">
        <div className="flex flex-wrap gap-1.5">
          {verticals.length === 0 ? (
            <span className="text-sm text-muted-foreground">—</span>
          ) : (
            verticals.map((v) => (
              <span
                key={v}
                className="rounded-full border border-violet/30 bg-violet/10 px-2 py-0.5 text-xs font-medium text-violet"
              >
                {v}
              </span>
            ))
          )}
        </div>
        {anomalyFlags !== 0 ? (
          <div className="mt-3 text-xs font-medium text-red-500">
            ⚠ Anomaly flags: 0x{anomalyFlags.toString(16).padStart(2, "0")}
          </div>
        ) : null}
      </Card>
    </section>
  );
}

function Card({
  label,
  highlight,
  children,
}: {
  label: string;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlight
          ? "border-violet/30 bg-violet/5"
          : "border-border bg-surface"
      }`}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function AttestationsList({
  attestations,
}: {
  attestations: AgentAttestationsResponse | null;
}) {
  if (!attestations || attestations.attestations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No attestations yet. Reputation is recorded on-chain once the agent
        completes a confirmed payout.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {attestations.attestations.map((item) => (
        <AttestationRow key={item.pda + item.kind} item={item} />
      ))}
    </ul>
  );
}

function AttestationRow({ item }: { item: AgentAttestationItem }) {
  const subtitle = describeAttestation(item);
  const created = new Date(item.createdAt);
  const expiresAt = item.expiry ? new Date(item.expiry) : null;
  const isExpired = expiresAt ? expiresAt.getTime() < Date.now() : false;

  return (
    <li className="rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <KindBadge kind={item.kind} />
        <StatusBadge status={item.status} expired={isExpired} />
        <span className="text-xs text-muted-foreground">
          {created.toLocaleString()}
        </span>
      </div>
      <div className="mt-2 text-sm text-foreground">{subtitle}</div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
        <Link
          href={explorerAccountUrl(item.pda, SOLANA_CLUSTER)}
          target="_blank"
          rel="noreferrer"
          className="break-all text-violet hover:underline"
        >
          PDA: {item.pda}
        </Link>
        {item.txHash ? (
          <Link
            href={explorerTxUrl(item.txHash, SOLANA_CLUSTER)}
            target="_blank"
            rel="noreferrer"
            className="break-all text-violet hover:underline"
          >
            tx: {item.txHash.slice(0, 12)}…
          </Link>
        ) : null}
      </div>
    </li>
  );
}

function describeAttestation(item: AgentAttestationItem): string {
  switch (item.kind) {
    case "snapshot":
      return `Weekly snapshot — schema ${item.schemaName}`;
    case "milestone": {
      const label =
        item.milestoneType !== null && MILESTONE_TYPE_LABEL[item.milestoneType];
      return label
        ? `Milestone: ${label}`
        : `Milestone (type 0x${(item.milestoneType ?? 0)
            .toString(16)
            .padStart(2, "0")})`;
    }
    case "tier_change":
      return `Tier ${item.fromTier ?? "?"} → ${item.toTier ?? "?"}`;
  }
}

function KindBadge({ kind }: { kind: AgentAttestationItem["kind"] }) {
  const styles: Record<AgentAttestationItem["kind"], string> = {
    snapshot: "bg-violet/15 text-violet border-violet/30",
    milestone: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    tier_change: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  };
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${styles[kind]}`}
    >
      {kind.replace("_", " ")}
    </span>
  );
}

function StatusBadge({
  status,
  expired,
}: {
  status: AgentAttestationItem["status"];
  expired: boolean;
}) {
  if (expired) {
    return (
      <span className="rounded-full border border-muted-foreground/30 bg-muted/30 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        expired
      </span>
    );
  }
  const styles: Record<AgentAttestationItem["status"], string> = {
    pending: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30",
    confirmed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    failed: "bg-red-500/10 text-red-600 border-red-500/30",
    closed: "bg-muted/30 text-muted-foreground border-muted-foreground/30",
  };
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}
