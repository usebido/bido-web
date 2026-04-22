"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CommandInputProps {
  command: string;
}

export function CommandInput({ command }: CommandInputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be unavailable in restricted contexts.
    }
  };

  return (
    <div className="relative inline-flex w-full max-w-xl items-center justify-between gap-4 rounded-xl border border-border bg-surface-2/80 px-5 py-4 font-mono text-sm shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:text-base">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <code className="relative z-10 truncate text-violet">
        <span className="text-muted-foreground">$ </span>
        {command}
      </code>

      <button
        type="button"
        onClick={handleCopy}
        className="relative z-10 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
        aria-label="Copy command"
      >
        {copied ? (
          <>
            <Check className="size-3.5" />
            Copied
          </>
        ) : (
          <>
            <Copy className="size-3.5" />
            Copy
          </>
        )}
      </button>
    </div>
  );
}
