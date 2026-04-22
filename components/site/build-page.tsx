"use client";

import { usePrivy } from "@privy-io/react-auth";
import { CommandInput } from "@/components/site/command-input";
import { Navbar } from "@/components/site/navbar";

export function BuildPage() {
  const { authenticated, login, ready } = usePrivy();

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
    <div className="min-h-screen bg-background text-foreground">
      <Navbar authenticated={authenticated} onLogin={login} />
      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[1100px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, oklch(0.4 0.15 295 / 0.45), transparent 70%)",
            }}
          />

          <div className="mx-auto max-w-[1200px] px-6 pb-32 pt-40 text-center">
            <h1 className="mx-auto max-w-5xl text-balance text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-[88px]">
              Uma skill. Seus agentes ja sabem onde recomendar.
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
              Plugue inteligencia de ads direto no seu agente. Uma linha, zero friccao.
            </p>

            <div className="mt-10 flex justify-center">
              <CommandInput command="npx skills add bido/ads" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
