"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { ChatMockup } from "@/components/site/chat-mockup";
import { WaitlistModal } from "@/components/site/waitlist-modal";

export function Hero({
  title,
  description,
  descriptionClassName,
}: {
  authenticated: boolean;
  onLogin: () => void;
  title?: string;
  description?: string;
  descriptionClassName?: string;
}) {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [heroEmail, setHeroEmail] = useState("");
  const { messages } = useI18n();

  return (
    <section className="relative overflow-hidden">
      <WaitlistModal
        open={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
        initialEmail={heroEmail}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[1100px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(closest-side, oklch(0.4 0.15 295 / 0.45), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-[1200px] px-6 pt-40 pb-0 text-left">
        <a
          href="#pricing"
          className="inline-flex items-center gap-2 rounded-md border border-violet/30 bg-violet-soft px-3 py-1.5 text-sm font-medium text-foreground/90 transition-colors hover:bg-violet-soft/80"
        >
          <span className="text-violet">{messages.hero.badgePrefix}</span>
          {messages.hero.badgeText}
          <ArrowRight className="h-4 w-4" />
        </a>

        <h1 className="mt-8 max-w-5xl text-balance text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-[88px]">
          {title ?? messages.hero.title}
        </h1>

        <p className={`mt-8 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl ${descriptionClassName ?? ""}`}>
          {description ?? messages.hero.description}
        </p>

        <form
          className="mt-10 flex h-14 w-full max-w-xl items-center gap-1 overflow-hidden rounded-xl border border-border bg-surface-2/60 p-1 backdrop-blur focus-within:border-violet/50"
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

        <div className="relative mt-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-10 h-40 bg-gradient-to-b from-background to-transparent"
          />
          <ChatMockup />
        </div>
      </div>
    </section>
  );
}
