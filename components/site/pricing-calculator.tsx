"use client";

import { useState } from "react";
import { Bot, Brain, MousePointerClick, Search } from "lucide-react";

const GOOGLE_CPC = 3.5;
const BIDO_CPD = 0.5;

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatVolume(value: number) {
  return Math.floor(value).toLocaleString("pt-BR");
}

export function PricingCalculator() {
  const [budget, setBudget] = useState(1000);

  const googleVolume = budget / GOOGLE_CPC;
  const bidoVolume = budget / BIDO_CPD;

  return (
    <section className="relative overflow-hidden py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl"
        style={{
          background: "radial-gradient(closest-side, oklch(0.4 0.15 295 / 0.5), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 text-left">
          <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-[44px]">
            Compare seu custo no <span className="text-muted-foreground">Google Ads</span> vs{" "}
            <span className="text-violet">Bido.</span>
          </h2>
        </div>

        <div className="mb-6 rounded-xl border border-border bg-surface-2 px-6 py-5">
          <label htmlFor="calc-budget" className="mb-3 block text-sm font-semibold text-muted-foreground">
            Orçamento mensal
          </label>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                R$
              </span>
              <input
                id="calc-budget"
                type="number"
                min={100}
                max={100000}
                step={100}
                value={budget}
                onChange={(event) => setBudget(Math.max(0, Number(event.target.value)))}
                className="h-12 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-sm font-semibold text-foreground outline-none ring-offset-background transition focus:border-violet/60 focus:ring-2 focus:ring-violet/30"
              />
            </div>
            <input
              type="range"
              min={100}
              max={10000}
              step={100}
              value={budget}
              onChange={(event) => setBudget(Number(event.target.value))}
              aria-label="Ajustar orçamento"
              className="h-2 flex-1 cursor-pointer accent-violet"
            />
            <span className="min-w-[90px] text-right text-sm font-bold text-foreground">
              {formatBRL(budget)}
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface-2">
          <div className="grid grid-cols-3 border-b border-border">
            <div className="px-6 py-4" />
            <div className="flex flex-col items-center justify-center gap-1.5 border-l border-border px-4 py-4">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-surface px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                <Search className="h-3 w-3" />
                Google Ads
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-1.5 border-l border-border bg-violet-soft/20 px-4 py-4">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-violet-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-violet">
                <Bot className="h-3 w-3" />
                Bido
              </div>
            </div>
          </div>

          <Row label="Custo por clique" sublabel="(CPC)">
            <Cell highlight={false}>
              <MetricValue
                value={formatBRL(GOOGLE_CPC)}
                icon={<MousePointerClick className="h-3.5 w-3.5" />}
              />
            </Cell>
            <Cell highlight>
              <span className="text-sm text-muted-foreground/50">—</span>
            </Cell>
          </Row>

          <Row label="Custo por decisão" sublabel="(CPD)">
            <Cell highlight={false}>
              <span className="text-sm text-muted-foreground/50">—</span>
            </Cell>
            <Cell highlight>
              <MetricValue
                value={formatBRL(BIDO_CPD)}
                icon={<Brain className="h-3.5 w-3.5" />}
                accent
              />
            </Cell>
          </Row>

          <Row label="Volume / mês" sublabel="(com esse budget)">
            <Cell highlight={false}>
              <AnimatedNumber value={googleVolume} suffix=" cliques" className="text-foreground" />
            </Cell>
            <Cell highlight>
              <AnimatedNumber value={bidoVolume} suffix=" decisões" className="font-bold text-violet" />
            </Cell>
          </Row>

          <Row label="Momento">
            <Cell highlight={false}>
              <Tag>após a busca</Tag>
            </Cell>
            <Cell highlight>
              <Tag accent>na decisão de compra</Tag>
            </Cell>
          </Row>

          <Row label="Público" last>
            <Cell highlight={false}>
              <Tag>humano</Tag>
            </Cell>
            <Cell highlight>
              <Tag accent>agente de IA</Tag>
            </Cell>
          </Row>
        </div>

        <div className="mt-6 rounded-xl border border-violet/20 bg-violet-soft/20 px-6 py-4">
          <p className="text-sm leading-relaxed text-foreground/80">
            <span className="font-semibold text-muted-foreground">No Google você paga por clique.</span>{" "}
            <span className="font-semibold text-violet">No Bido você paga por decisão.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

function Row({
  label,
  sublabel,
  children,
  last,
}: {
  label: string;
  sublabel?: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return <div className={`grid grid-cols-3 ${last ? "" : "border-b border-border"}`}>{children ? (
      <>
        <div className="flex flex-col justify-center px-6 py-4">
          <span className="text-sm font-semibold text-foreground">{label}</span>
          {sublabel ? (
            <span className="mt-0.5 font-mono text-[10px] text-muted-foreground/60">{sublabel}</span>
          ) : null}
        </div>
        {children}
      </>
    ) : null}</div>;
}

function Cell({ highlight, children }: { highlight: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`flex items-center justify-center border-l border-border px-4 py-4 ${highlight ? "bg-violet-soft/10" : ""}`}
    >
      {children}
    </div>
  );
}

function MetricValue({
  value,
  icon,
  accent,
}: {
  value: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${accent ? "text-violet" : "text-foreground"}`}>
      <span className={accent ? "text-violet" : "text-muted-foreground"}>{icon}</span>
      {value}
    </span>
  );
}

function Tag({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${
        accent ? "bg-violet-soft text-violet" : "bg-surface text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

function AnimatedNumber({
  value,
  suffix,
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  return (
    <span className={`text-sm font-bold tabular-nums ${className ?? ""}`}>
      {formatVolume(value)}
      {suffix ? <span className="ml-1 text-xs font-normal text-muted-foreground">{suffix}</span> : null}
    </span>
  );
}
