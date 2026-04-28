"use client";

import Image from "next/image";
import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { useI18n } from "@/components/providers/i18n-provider";
import { WaitlistModal } from "@/components/site/waitlist-modal";
import { ThemeToggle } from "@/components/site/theme-toggle";

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

type Brand = {
  name: string;
  tag?: string;
  logo?: string;
  quote?: string;
};

function LogoCell({
  brand,
  onHover,
  onLeave,
  isHovered,
}: {
  brand: Brand;
  onHover: (brand: Brand) => void;
  onLeave: () => void;
  isHovered: boolean;
}) {
  const interactive = Boolean(brand.tag);

  return (
    <div className="relative flex flex-col items-center gap-2">
      <div className="flex h-14 items-center justify-center">
        {brand.logo === "solana" ? (
          <Image
            src="/solana-black.png"
            alt="Solana logo"
            width={96}
            height={54}
            className="h-[54px] w-[96px] object-contain dark:brightness-0 dark:invert"
          />
        ) : (
          <div className="flex h-10 items-center text-center text-[20px] font-bold tracking-tight text-foreground/88">
            {brand.name}
          </div>
        )}
      </div>
      {brand.tag ? (
        <button
          type="button"
          onMouseEnter={() => interactive && onHover(brand)}
          onMouseLeave={() => interactive && onLeave()}
          className="rounded-full border border-violet/20 bg-violet/8 px-2.5 py-0.5 text-[11px] font-medium text-violet transition-colors hover:bg-violet/14"
        >
          {brand.tag}
        </button>
      ) : null}

      {/* Quote bubble relative to this logo cell */}
      <div
        className={`pointer-events-none absolute bottom-full left-1/2 z-50 mb-4 w-72 md:w-96 -translate-x-1/2 transition-all duration-200 ${
          isHovered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        {brand.quote ? (
          <div
            className="rounded-2xl border border-white/50 p-7 text-white shadow-[0_30px_70px_rgba(88,28,135,0.18)]"
            style={{ backgroundColor: "rgba(124,58,237,0.92)" }}
          >
            <div className="mb-4 text-3xl font-black leading-none opacity-90">”</div>
            <p className="text-[16px] leading-snug">{brand.quote}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TrustWall() {
  const { messages } = useI18n();
  const [hovered, setHovered] = useState<Brand | null>(null);
  const useCaseBrands: readonly Brand[] = messages.home.useCases.items;

  return (
    <section className="px-3 pb-16 sm:px-4">
      <div className="mx-auto max-w-[1400px]">
        <p className="mx-auto max-w-2xl text-center text-[12px] font-semibold uppercase leading-relaxed tracking-wider text-muted-foreground">
          {messages.home.useCases.eyebrow}
        </p>

        <div className="relative mt-10">
          <div className="relative z-10 mx-auto grid max-w-md justify-items-center grid-cols-1 gap-12">
            {useCaseBrands.map((brand) => (
              <LogoCell
                key={brand.name}
                brand={brand}
                onHover={setHovered}
                onLeave={() => setHovered(null)}
                isHovered={hovered?.name === brand.name}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { ready, authenticated, login } = usePrivy();
  const { messages, replace } = useI18n();
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [heroEmail, setHeroEmail] = useState("");

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
    <div id="top" className="min-h-screen bg-background text-foreground">
      <WaitlistModal
        open={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
        initialEmail={heroEmail}
      />
      <Navbar authenticated={authenticated} onLogin={login} />

      <main>
        {/* ── Hero ── */}
        <section className="px-3 pb-20 pt-24 sm:px-4 sm:pt-28">
          <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[28px] border border-violet/14 bg-surface px-6 pb-14 pt-20 shadow-[0_28px_90px_rgba(88,28,135,0.08)] dark:border-violet/20 dark:shadow-[0_28px_90px_rgba(0,0,0,0.42)] sm:pt-28">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-90 dark:hidden"
              style={{
                background: `
                  radial-gradient(900px 320px at 50% 0%, rgba(167,139,250,0.16), transparent 72%),
                  radial-gradient(540px 240px at 12% 88%, rgba(244,114,182,0.1), transparent 68%),
                  radial-gradient(540px 240px at 88% 88%, rgba(34,197,94,0.09), transparent 68%)
                `,
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.4] dark:hidden"
              style={{
                backgroundImage:
                  "radial-gradient(1200px 400px at 50% 0%, rgba(255,255,255,0.9), transparent 70%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 hidden opacity-90 dark:block"
              style={{
                background: `
                  radial-gradient(900px 320px at 50% 0%, rgba(167,139,250,0.2), transparent 72%),
                  radial-gradient(540px 240px at 12% 88%, rgba(167,139,250,0.12), transparent 68%),
                  radial-gradient(540px 240px at 88% 88%, rgba(34,197,94,0.08), transparent 68%)
                `,
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 hidden opacity-[0.24] dark:block"
              style={{
                backgroundImage:
                  "radial-gradient(1200px 400px at 50% 0%, rgba(255,255,255,0.06), transparent 70%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 -left-12 h-64 w-64 rounded-full blur-3xl"
              style={{ background: "rgba(167,139,250,0.12)" }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 -right-12 h-72 w-72 rounded-full blur-3xl"
              style={{ background: "rgba(244,114,182,0.1)" }}
            />

            <div className="relative z-10 mx-auto max-w-[1100px] text-center">
              <h1 className="mx-auto max-w-5xl text-balance font-heading text-[44px] font-extrabold leading-[0.95] tracking-[-0.04em] text-foreground sm:text-[64px] md:text-[84px] lg:text-[96px]">
                {messages.home.headline}
              </h1>

              <p className="mx-auto mt-7 max-w-2xl text-[17px] leading-relaxed text-muted-foreground sm:text-[19px]">
                {messages.home.subheadline}
              </p>

              <form
                className="mx-auto mt-10 flex h-14 w-full max-w-xl items-center gap-1 overflow-hidden rounded-xl border border-border bg-surface-2/60 p-1 backdrop-blur focus-within:border-violet/50"
                onSubmit={(e) => {
                  e.preventDefault();
                  setWaitlistOpen(true);
                }}
              >
                <input
                  type="email"
                  placeholder={messages.waitlist.form.emailPlaceholder}
                  value={heroEmail}
                  onChange={(e) => setHeroEmail(e.target.value)}
                  className="h-full w-full min-w-0 bg-transparent px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button
                  type="submit"
                  className="group relative inline-flex h-full shrink-0 items-center justify-center gap-2 overflow-hidden rounded-lg bg-violet px-6 text-base font-semibold text-violet-foreground shadow-lg shadow-violet/20 transition-colors duration-300 hover:text-black"
                >
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-0 bg-white transition-all duration-300 ease-out group-hover:h-full"
                  />
                  <span className="relative z-10 inline-flex items-center gap-2">
                    {messages.hero.waitlist}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
              </form>

            </div>
          </div>
        </section>

        <TrustWall />

        {/* ── Footer ── */}
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
