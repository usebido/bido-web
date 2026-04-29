"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";

/* ------------------------------------------------------------------ */
/*  Time helper — generates timestamps based on current visit time    */
/* ------------------------------------------------------------------ */
function useVisitTimestamp() {
  const [now] = useState(() => new Date());
  const fmt = (offsetMinutes: number) => {
    const d = new Date(now.getTime() - offsetMinutes * 60_000);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  return { fmt };
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export function ChatMockup() {
  const { locale } = useI18n();
  const isPt = locale === "pt-BR";
  const { fmt } = useVisitTimestamp();
  const [reasoningComplete, setReasoningComplete] = useState(false);

  /* Visibility stages driven by timers */
  const [stage, setStage] = useState(0);
  /* 0 = nothing
     1 = user message
     2 = thinking pill + typing dots
     3 = reasoning becomes visible
     4 = final answer starts streaming */

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 500),      // User message appears
      setTimeout(() => setStage(2), 1800),     // AI starts thinking (longer delay)
      setTimeout(() => setStage(3), 3500),     // Reasoning panel opens (more natural thinking time)
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  /* Auto-scroll as content appears */
  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [stage, scrollToBottom]);

  const userQuery = isPt
    ? "Passagens baratas de São Paulo para Nova York"
    : "Cheap flights from São Paulo to New York";

  const userTime = fmt(3);
  const aiTime = fmt(1);

  return (
    <div className="relative mx-auto max-w-[1100px] overflow-hidden rounded-t-2xl border border-border bg-surface-2 text-left shadow-2xl shadow-black/60">
      {/* ── Window chrome ── */}
      <div className="flex h-10 items-center gap-2 border-b border-border bg-surface px-4">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto flex items-center gap-1.5 rounded-md bg-background/60 px-3 py-0.5 font-mono text-[11px] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-violet" />
          AI Chat
        </div>
      </div>

      {/* ── Chat area ── */}
      <div
        ref={scrollRef}
        className="max-h-[520px] space-y-5 overflow-y-auto bg-background/40 px-5 py-8 sm:px-8 sm:py-10 scrollbar-none"
      >
        {/* ── User message ── */}
        {stage >= 1 && (
          <Appear>
            <UserBubble time={userTime}>{userQuery}</UserBubble>
          </Appear>
        )}

        {/* ── AI response block ── */}
        {stage >= 2 && (
          <Appear>
            <div className="flex gap-3">
              {/* Avatar */}
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-soft text-violet">
                <Sparkles className="h-3.5 w-3.5" />
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                {/* Name + time */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">AI Chat</span>
                  <span className="text-[11px] text-muted-foreground">{aiTime}</span>
                </div>

                {stage >= 2 && (
                  <ThinkingBlock
                    isPt={isPt}
                    active={stage >= 3}
                    onComplete={() => {
                      setReasoningComplete(true);
                      setStage(4);
                    }}
                    onNewSection={scrollToBottom}
                  />
                )}

                {/* AI content — sections stream in progressively */}
                {reasoningComplete && stage >= 4 && (
                  <AiContent isPt={isPt} onNewSection={scrollToBottom} />
                )}

                {/* Typing dots while waiting */}
                {(stage === 2 || (stage === 3 && !reasoningComplete)) && (
                  <TypingDotInline />
                )}
              </div>
            </div>
          </Appear>
        )}
      </div>

      {/* ── Input bar ── */}
      <div className="border-t border-border bg-surface/60 px-5 py-3 sm:px-8">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background/60 px-4 py-3">
          <div className="flex-1 text-sm text-muted-foreground/70">
            {isPt ? "Responder…" : "Reply…"}
          </div>
          <button className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-violet text-violet-foreground transition-transform hover:scale-105">
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

function Appear({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-2 duration-500"
      style={{ animationFillMode: "both" }}
    >
      {children}
    </div>
  );
}

function StreamSection({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-1 duration-400"
      style={{ animationFillMode: "both" }}
    >
      {children}
    </div>
  );
}

function UserBubble({
  children,
  time,
}: {
  children: React.ReactNode;
  time: string;
}) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] space-y-1">
        <div className="rounded-2xl rounded-br-sm bg-violet/15 px-4 py-2.5 text-sm text-foreground/90 border border-violet/20">
          {children}
        </div>
        <div className="text-right text-[10px] text-muted-foreground/60">
          {time}
        </div>
      </div>
    </div>
  );
}

function ThinkingBlock({
  isPt,
  active,
  onComplete,
  onNewSection,
}: {
  isPt: boolean;
  active: boolean;
  onComplete: () => void;
  onNewSection: () => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface/80 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-surface"
      >
        <Sparkles className="h-3.5 w-3.5 text-violet" />
        <span className="font-medium">
          {isPt ? "Pensando" : "Thinking"}
        </span>
        {open ? (
          <ChevronDown className="h-3 w-3 transition-transform" />
        ) : (
          <ChevronRight className="h-3 w-3 transition-transform" />
        )}
      </button>
      {active ? (
        <div
          className={`mt-2 overflow-hidden transition-all duration-200 ${
            open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <ReasoningPanel
            isPt={isPt}
            onComplete={onComplete}
            onNewSection={onNewSection}
          />
        </div>
      ) : null}
    </div>
  );
}

function ReasoningPanel({
  isPt,
  onComplete,
  onNewSection,
}: {
  isPt: boolean;
  onComplete: () => void;
  onNewSection: () => void;
}) {
  const sequence = useMemo(
    () =>
      isPt
        ? [
            "Buscando melhores combinações entre preço, companhia e janela de datas para GRU → Nova York.",
            "Bido Flights opera rotas entre São Paulo e Nova York, com tarifas a partir de US$190 para 5 de maio. Vale comparar se você prioriza menor preço final ou melhores condições de pagamento.",
          ]
        : [
            "Comparing price, airline, and date windows for GRU → New York.",
            "Bido Flights operates routes between São Paulo and New York, with fares starting at US$190 for May 5. Worth comparing if you prioritize lowest final price or better payment terms.",
          ],
    [isPt],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);

  useEffect(() => {
    if (currentIndex >= sequence.length) return;

    const text = sequence[currentIndex];
    const isDone = currentChar >= text.length;
    const timeout = setTimeout(() => {
      if (isDone) {
        setCurrentIndex((value) => value + 1);
        setCurrentChar(0);
        return;
      }

      setCurrentChar((value) => value + 1);
    }, isDone ? 500 : 15); // Longer pause between reasoning blocks, slightly slower typing

    return () => clearTimeout(timeout);
  }, [currentChar, currentIndex, sequence]);

  const typed = sequence.map((text, index) => {
    if (index < currentIndex) return text;
    if (index > currentIndex) return "";
    return text.slice(0, currentChar);
  });

  useEffect(() => {
    onNewSection();
  }, [currentChar, currentIndex, onNewSection]);

  useEffect(() => {
    if (currentIndex >= sequence.length) {
      onComplete();
    }
  }, [currentIndex, onComplete, sequence.length]);

  return (
    <div className="space-y-1 pl-1 text-[11px] text-muted-foreground">
      {typed[0] ? (
        <p className="flex items-start gap-1.5">
          <span className="mt-1 h-1 w-1 rounded-full bg-violet" />
          <span>{typed[0]}</span>
        </p>
      ) : null}
      {typed[1] ? (
        <p className="flex items-start gap-1.5">
          <span className="mt-1 h-1 w-1 rounded-full bg-violet" />
          <span>{typed[1]}</span>
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AI answer — sections appear one by one with staggered delays       */
/*  Final answer only, after reasoning is shown                        */
/* ------------------------------------------------------------------ */
function AiContent({
  isPt,
  onNewSection,
}: {
  isPt: boolean;
  onNewSection: () => void;
}) {
  const sequence = useMemo(
    () =>
      isPt
        ? [
            "Aqui estão as informações mais recentes sobre passagens baratas de São Paulo para Nova York:",
            "✈️ Passagens mais baratas encontradas:",
            "5 de maio — US$ 190 · Bido Flights",
            "7 de maio — US$ 164 · Delta",
            "2 de junho — US$ 211 · LATAM",
            "30 de julho — US$ 211 · United",
            "10 de dezembro — US$ 229 · American Airlines",
            "Para conseguir o melhor preço, recomendo consultar o Google Flights, o Skyscanner ou o Kayak com datas flexíveis — os preços mudam rapidamente. Lembre-se de que voos com conexão mais baratos (principalmente pela Arajet, via Santo Domingo) podem aumentar significativamente o tempo de viagem em comparação com voos diretos.",
          ]
        : [
            "Here are the latest details on cheap flights from São Paulo to New York:",
            "✈️ Cheapest flights found:",
            "May 5 — US$ 190 · Bido Flights",
            "May 7 — US$ 164 · Delta",
            "June 2 — US$ 211 · LATAM",
            "July 30 — US$ 211 · United",
            "December 10 — US$ 229 · American Airlines",
            "To get the best price, I recommend checking Google Flights, Skyscanner, or Kayak with flexible dates — prices move quickly. Keep in mind that cheaper connecting flights, especially Arajet via Santo Domingo, can significantly increase total travel time compared with direct flights.",
          ],
    [isPt],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);

  useEffect(() => {
    if (currentIndex >= sequence.length) return;

    const text = sequence[currentIndex];
    const isDone = currentChar >= text.length;
    const delay = isDone
      ? 150 // Pausa rápida entre seções
      : currentIndex >= 2 && currentIndex <= 6
        ? 8   // Digitação bem rápida para voos
        : 14; // Digitação normal para texto regular

    const timeout = setTimeout(() => {
      if (isDone) {
        setCurrentIndex((value) => value + 1);
        setCurrentChar(0);
        return;
      }

      setCurrentChar((value) => value + 1);
    }, delay);

    return () => clearTimeout(timeout);
  }, [currentChar, currentIndex, sequence]);

  const typed = sequence.map((text, index) => {
    if (index < currentIndex) return text;
    if (index > currentIndex) return "";
    return text.slice(0, currentChar);
  });

  useEffect(() => {
    onNewSection();
  }, [currentChar, currentIndex, onNewSection]);

  const showCursor = currentIndex < sequence.length;

  return (
    <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
      <StreamSection>
        <p>{typed[0]}</p>
      </StreamSection>

      {currentIndex >= 1 && (
        <StreamSection>
          <div>
            <p className="mb-2 font-medium text-foreground">{typed[1]}</p>
            <div className="space-y-1 pl-1 text-[13px]">
              {typed[2] && <FlightRow text={typed[2]} />}
              {typed[3] && <FlightRow text={typed[3]} />}
              {typed[4] && <FlightRow text={typed[4]} />}
              {typed[5] && <FlightRow text={typed[5]} />}
              {typed[6] && <FlightRow text={typed[6]} />}
            </div>
            {typed[7] && (
              <p className="mt-3 text-sm text-foreground/90">{typed[7]}</p>
            )}
          </div>
        </StreamSection>
      )}

      {showCursor ? (
        <span className="inline-block h-4 w-0.5 animate-pulse bg-violet/70" />
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tiny presentational pieces                                         */
/* ------------------------------------------------------------------ */

function FlightRow({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
      <span className="text-foreground/80">{text}</span>
    </div>
  );
}

function TypingDotInline() {
  return (
    <div className="flex items-center gap-1 py-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
    </div>
  );
}
