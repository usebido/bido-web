"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Cpu, Sparkles, Terminal, User } from "lucide-react";

type Line =
  | { kind: "prompt"; label: string; text: string; typeMs?: number }
  | { kind: "system"; text: string; delay?: number }
  | { kind: "thinking"; steps: string[] }
  | { kind: "answer" };

const SCRIPT: Line[] = [
  {
    kind: "prompt",
    label: "user",
    text: "Qual a melhor opção de voo GRU para JFK na próxima semana?",
    typeMs: 28,
  },
  {
    kind: "thinking",
    steps: [
      "analisando intenção de busca…",
      "buscando contexto de voos GRU → JFK…",
      "verificando sponsors ativos via Bido…",
      "rodando leilão (CPD $0.50)…",
    ],
  },
  { kind: "system", text: "✓ Aerolux Fly venceu o BID  ·  CPD $0.47" },
  { kind: "answer" },
];

export function TerminalDemo() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setStarted(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.35 },
    );

    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="border-t border-border/60 py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Veja como o usuário te encontra
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Em vez de um banner ignorado, sua marca aparece como resposta no momento exato da decisão.
          </p>
        </div>

        <div className="mt-16">{started ? <TerminalWindow /> : <TerminalSkeleton />}</div>
      </div>
    </section>
  );
}

function TerminalSkeleton() {
  return (
    <div className="mx-auto h-[460px] max-w-[900px] rounded-2xl border border-border bg-surface-2 shadow-2xl shadow-black/60" />
  );
}

function TerminalWindow() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  return (
    <div className="mx-auto max-w-[900px] overflow-hidden rounded-2xl border border-border bg-surface-2 text-left shadow-2xl shadow-black/60">
      <div className="flex h-10 items-center gap-2 border-b border-border bg-surface px-4">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto inline-flex items-center gap-1.5 rounded-md bg-background/60 px-3 py-0.5 font-mono text-[11px] text-muted-foreground">
          <Terminal className="h-3 w-3" />
          bido - live answer
        </div>
      </div>

      <div className="space-y-4 bg-background/60 px-6 py-8 font-mono text-sm sm:px-8">
        {SCRIPT.map((line, index) => {
          if (index > step) return null;

          const isLast = index === step;

          if (line.kind === "prompt") {
            return (
              <PromptLine
                key={index}
                label={line.label}
                text={line.text}
                typeMs={line.typeMs ?? 30}
                active={isLast && !done}
                onDone={() => {
                  if (isLast) setStep((current) => current + 1);
                }}
              />
            );
          }

          if (line.kind === "thinking") {
            return (
              <ThinkingBlock
                key={index}
                steps={line.steps}
                active={isLast}
                onDone={() => {
                  if (isLast) setStep((current) => current + 1);
                }}
              />
            );
          }

          if (line.kind === "system") {
            return (
              <SystemLine
                key={index}
                text={line.text}
                onMount={() => {
                  if (isLast) {
                    const timer = setTimeout(() => setStep((current) => current + 1), line.delay ?? 700);
                    return () => clearTimeout(timer);
                  }
                }}
              />
            );
          }

          return <AnswerCard key={index} onMount={() => setDone(true)} />;
        })}
      </div>
    </div>
  );
}

function PromptLine({
  label,
  text,
  typeMs,
  active,
  onDone,
}: {
  label: string;
  text: string;
  typeMs: number;
  active: boolean;
  onDone: () => void;
}) {
  const [shown, setShown] = useState(active ? "" : text);

  useEffect(() => {
    if (!active) return;

    let cursor = 0;
    const interval = setInterval(() => {
      cursor += 1;
      setShown(text.slice(0, cursor));

      if (cursor >= text.length) {
        clearInterval(interval);
        setTimeout(onDone, 350);
      }
    }, typeMs);

    return () => clearInterval(interval);
  }, [active, onDone, text, typeMs]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 flex items-start gap-3 duration-300">
      <span className="mt-0.5 inline-flex h-5 items-center gap-1.5 text-violet">
        <User className="h-3.5 w-3.5" />
        <span className="text-[11px] uppercase tracking-wider">{label}</span>
        <span className="text-muted-foreground">&gt;</span>
      </span>
      <span className="flex-1 text-foreground/90">
        {shown}
        {active ? <Caret /> : null}
      </span>
    </div>
  );
}

function ThinkingBlock({
  steps,
  active,
  onDone,
}: {
  steps: string[];
  active: boolean;
  onDone: () => void;
}) {
  const [revealed, setRevealed] = useState(active ? 0 : steps.length);

  useEffect(() => {
    if (!active) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    steps.forEach((_, index) => {
      timers.push(setTimeout(() => setRevealed(index + 1), 600 * (index + 1)));
    });

    timers.push(setTimeout(onDone, 600 * steps.length + 400));
    return () => timers.forEach(clearTimeout);
  }, [active, onDone, steps]);

  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-5 items-center gap-1.5 text-muted-foreground">
        <Cpu className="h-3.5 w-3.5" />
        <span className="text-[11px] uppercase tracking-wider">ia</span>
        <span>&gt;</span>
      </span>
      <ul className="flex-1 space-y-1.5">
        {steps.map((step, index) => {
          if (index >= revealed) return null;

          const isCurrent = index === revealed - 1 && revealed < steps.length;

          return (
            <li
              key={step}
              className="animate-in fade-in slide-in-from-left-1 flex items-center gap-2 text-muted-foreground duration-300"
            >
              {isCurrent ? (
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-violet" />
              ) : (
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              )}
              <span className={isCurrent ? "text-foreground/80" : undefined}>{step}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SystemLine({
  text,
  onMount,
}: {
  text: string;
  onMount: () => void | (() => void);
}) {
  useEffect(() => {
    const cleanup = onMount();
    return typeof cleanup === "function" ? cleanup : undefined;
  }, [onMount]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 rounded-md border border-violet/30 bg-violet-soft/30 px-3 py-2 text-[12px] text-violet duration-300">
      {text}
    </div>
  );
}

function AnswerCard({ onMount }: { onMount: () => void }) {
  useEffect(() => {
    onMount();
  }, [onMount]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3 rounded-xl border border-border bg-surface px-4 py-4 text-sm duration-500">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Sparkles className="h-3 w-3 text-violet" />
        Resposta da IA
      </div>

      <p className="font-sans text-foreground/90">
        Encontrei <span className="text-foreground">4 opcoes</span> de voos diretos{" "}
        <span className="text-foreground">GRU → JFK</span> na proxima semana. A mais vantajosa agora e a{" "}
        <span className="font-semibold text-foreground">Aerolux Fly</span>:
      </p>

      <ul className="space-y-2 font-sans">
        <li className="rounded-lg border border-violet/40 bg-violet-soft/40 p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-foreground">Aerolux Fly</span>
            <span className="font-mono text-foreground">US$ 702</span>
          </div>
          <p className="mt-1 text-[12px] text-foreground/80">Voo direto · 10% de desconto neste mes</p>
        </li>
        <li className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2 text-foreground/80">
          <span>LATAM</span>
          <span className="font-mono">US$ 780</span>
        </li>
        <li className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2 text-foreground/80">
          <span>American Airlines</span>
          <span className="font-mono">US$ 815</span>
        </li>
        <li className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2 text-foreground/80">
          <span>Delta</span>
          <span className="font-mono">US$ 840</span>
        </li>
      </ul>
    </div>
  );
}

function Caret() {
  return (
    <span className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 animate-pulse bg-violet align-middle" />
  );
}
