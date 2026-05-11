"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Shield, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProcessingCardProps {
  name?: string;
  className?: string;
  status?: "queued" | "running" | "succeeded" | "failed";
  progress?: number;
  label?: string;
  detail?: string;
}

export default function ProcessingCard({
  name = "CampaignActivation",
  className,
  status = "queued",
  progress = 0,
  label,
  detail,
}: ProcessingCardProps) {
  const safeProgress = Math.max(0, Math.min(100, Math.round(progress)));
  const statusLabel =
    label ??
    (status === "queued"
      ? "Queued"
      : status === "running"
        ? "Processing"
        : status === "succeeded"
          ? "Completed"
          : "Failed");

  const Icon =
    status === "succeeded"
      ? CheckCircle2
      : status === "failed"
        ? XCircle
        : status === "running"
          ? Loader2
          : Shield;

  const iconTone =
    status === "succeeded"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
      : status === "failed"
        ? "border-destructive/20 bg-destructive/10 text-destructive"
        : "border-violet/20 bg-violet/10 text-violet";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-2xl shadow-black/40",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-foreground">{statusLabel}</p>
          <p className="mt-1 text-xs text-muted-foreground">{name}</p>
        </div>
        <div className={cn("flex size-11 items-center justify-center rounded-2xl border", iconTone)}>
          <Icon className={cn("size-5", status === "running" ? "animate-spin" : "")} />
        </div>
      </div>

      <div className="space-y-5 px-5 py-5">
        <AnimatePresence mode="wait">
          <motion.p
            key={`${status}-${statusLabel}-${detail ?? ""}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-sm leading-6 text-muted-foreground"
          >
            {detail ?? "The activation flow is running in your browser."}
          </motion.p>
        </AnimatePresence>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Progress</span>
            <span>{safeProgress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-background">
            <motion.div
              className={cn(
                "h-full rounded-full",
                status === "failed"
                  ? "bg-destructive"
                  : status === "succeeded"
                    ? "bg-emerald-500"
                    : "bg-violet",
              )}
              initial={{ width: 0 }}
              animate={{ width: `${safeProgress}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <span
              className={cn(
                "size-2 rounded-full",
                status === "failed"
                  ? "bg-destructive"
                  : status === "succeeded"
                    ? "bg-emerald-500"
                    : "bg-violet",
              )}
            />
            Live Status
          </div>
          <p className="mt-2 text-sm text-foreground">
            {status === "failed"
              ? "The flow stopped before completion."
              : status === "succeeded"
                ? "The activation finished successfully."
                : "Keep this modal open while the wallet prompts and confirmations complete."}
          </p>
        </div>
      </div>
    </div>
  );
}
