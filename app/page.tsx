"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Hero } from "@/components/site/hero";
import { Navbar } from "@/components/site/navbar";
import { PricingCalculator } from "@/components/site/pricing-calculator";
import { TerminalDemo } from "@/components/site/terminal-demo";
import { Banknote, Gauge, Target, LineChart } from "lucide-react";

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4">
      <path d="M18.901 1.153h3.68l-8.04 9.19 9.458 12.504h-7.405l-5.8-7.584-6.633 7.584H.48l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932Zm-1.291 19.492h2.039L6.486 3.24H4.298L17.61 20.645Z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4">
      <path d="M12 .297a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.577v-2.234c-3.338.726-4.042-1.61-4.042-1.61-.546-1.386-1.333-1.756-1.333-1.756-1.09-.744.083-.729.083-.729 1.204.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.419-1.304.762-1.604-2.665-.304-5.467-1.334-5.467-5.932 0-1.31.468-2.381 1.235-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.323 3.3 1.23a11.49 11.49 0 0 1 6 0c2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.233 1.911 1.233 3.221 0 4.61-2.807 5.625-5.48 5.921.43.372.814 1.103.814 2.222v3.293c0 .319.216.694.825.576A12 12 0 0 0 12 .297Z" />
    </svg>
  );
}

export default function HomePage() {
  const { ready, authenticated, login } = usePrivy();

const features = [
  {
    icon: Banknote,
    title: "Depósito via PIX",
    desc: "Sem cartão internacional. Sem crypto. Deposita em reais e sua campanha está no ar em minutos.",
  },
  {
    icon: Gauge,
    title: "Bid Optimizer",
    desc: "O Bido ajusta seus lances automaticamente para maximizar aparições dentro do seu orçamento diário.",
  },
  {
    icon: Target,
    title: "Targeting por intenção",
    desc: "Escolha as queries exatas onde quer aparecer. Seu anúncio só roda quando a busca é relevante pro seu negócio.",
  },
  {
    icon: LineChart,
    title: "Relatório em tempo real",
    desc: "Veja queries, impressões e decisões geradas — tudo num dashboard simples, sem precisar de analista.",
  },
];

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div className="rounded-2xl border border-border bg-surface-2 px-6 py-5 text-sm text-muted-foreground">
          Carregando experiência Bido…
        </div>
      </main>
    );
  }

  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      <Navbar authenticated={authenticated} onLogin={login} />
      <main>
        <Hero authenticated={authenticated} onLogin={login} />

        <section className="border-t border-border/60 py-32">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              Feito para marcas que querem estar onde a decisão acontece.
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              O Bido traz estrutura para anunciar na era dos agentes de IA.
            </p>

            <div className="mt-16 grid gap-6 sm:grid-cols-2">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-border bg-surface-2 p-6"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-violet-soft text-violet">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold">{f.title}</h3>
                  <p className="mt-2 text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <TerminalDemo />


        <section id="pricing" className="border-t border-border/60">
          <PricingCalculator />
        </section>
        
        <footer className="border-t border-border/60 py-12">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 text-sm text-muted-foreground">
            <span>© {new Date().getFullYear()} Bido</span>
            <div className="flex items-center gap-3">
              <a
                href="https://x.com/usebido"
                target="_blank"
                rel="noreferrer"
                aria-label="X"
                className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface-2 transition-colors hover:text-foreground"
              >
                <XIcon />
              </a>
              <a
                href="https://github.com/bido-solana"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface-2 transition-colors hover:text-foreground"
              >
                <GitHubIcon />
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
