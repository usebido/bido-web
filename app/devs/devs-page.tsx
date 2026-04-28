"use client";

import { usePrivy } from "@privy-io/react-auth";
import { ArrowRight, ArrowUpRight, BookOpen } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { AgentRevenueCalculator } from "@/components/site/agent-revenue-calculator";
import { InstallTerminal } from "@/components/site/install-terminal";
import { Navbar } from "@/components/site/navbar";
import { HowItWorks } from "@/components/site/how-it-works";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { FaqsSection } from "@/components/ui/faqs-1";

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

export function DevsPage() {
  const { authenticated, login, ready } = usePrivy();
  const { messages, replace } = useI18n();
  const devs = messages.devs;

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div className="rounded-2xl border border-border bg-surface-2 px-6 py-5 text-sm text-muted-foreground">
          {messages.common.loadingExperience}
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar authenticated={authenticated} onLogin={login} />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[700px] w-[1200px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, oklch(0.4 0.15 295 / 0.5), transparent 70%)",
            }}
          />

          <div className="mx-auto max-w-6xl px-6 pb-16 pt-40 text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-md border border-violet/30 bg-violet-soft px-3 py-1.5 text-sm font-medium text-foreground/90">
              <span className="text-violet">{messages.hero.badgePrefix}</span>
              {messages.hero.badgeText}
              <ArrowRight className="h-4 w-4" />
            </div>

            <h1 className="mx-auto max-w-5xl text-balance text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-[84px]">
              {devs.title}
              <br />
              <span className="text-muted-foreground">{devs.titleMuted}</span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
              {devs.description}
            </p>
          </div>

          <div className="mx-auto max-w-6xl px-6 pb-32">
            <div id="install-skill">
              <InstallTerminal />
            </div>
            
            <div className="mt-10 flex flex-col items-center gap-5">
              <a
                href="/docs"
                className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface-2/60 px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur transition-all hover:border-violet/50 hover:bg-surface-2"
              >
                <BookOpen className="size-4 text-violet" />
                {devs.docsCta}
                <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </a>


            <p className="mx-auto max-w-xl text-center text-sm text-muted-foreground">
              {devs.compatibility}
            </p>
            </div>
          </div>
        </section>

        <HowItWorks />
        <AgentRevenueCalculator />
        <FaqsSection variant="devs" />

        <footer className="border-t border-border/60 py-12">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 text-sm text-muted-foreground">
            <span>{replace(messages.common.footerCopy, { year: new Date().getFullYear() })}</span>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <a
                href="https://x.com/usebido"
                target="_blank"
                rel="noreferrer"
                aria-label={messages.common.socialX}
                className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface-2 transition-colors hover:text-foreground"
              >
                <XIcon />
              </a>
              <a
                href="https://github.com/bido-solana"
                target="_blank"
                rel="noreferrer"
                aria-label={messages.common.socialGitHub}
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
