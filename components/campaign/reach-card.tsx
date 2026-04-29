"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Slider } from "@/components/ui/slider";

function calcImpressions(reach: number, budget: number): number {
  if (reach === 0) return 0;
  const base = reach * 14;
  const budgetMultiplier = Math.max(1, budget / 10);
  return Math.round(base * budgetMultiplier);
}

function calcClicks(impressions: number): number {
  return Math.round(impressions * 0.032);
}

function formatNumber(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

export function ReachCard({
  reach,
  onReachChange,
  dailyBudget,
}: {
  reach: number;
  onReachChange: (value: number) => void;
  dailyBudget: number;
}) {
  const [activeTab, setActiveTab] = useState<"weekly" | "daily">("weekly");
  const impressions = calcImpressions(reach, dailyBudget);
  const clicks = calcClicks(impressions);
  const displayedImpressions = activeTab === "weekly" ? impressions * 7 : impressions;
  const displayedClicks = activeTab === "weekly" ? clicks * 7 : clicks;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 text-base font-semibold text-foreground">Reach</h3>

      <div className="relative mb-1 pt-7">
        <div
          className="pointer-events-none absolute -top-0 flex flex-col items-center transition-all duration-200"
          style={{ left: `clamp(0%, ${reach}%, calc(100% - 32px))` }}
        >
          <div className="flex items-center gap-1 rounded-lg bg-foreground px-2 py-1 text-xs font-medium whitespace-nowrap text-background shadow-sm">
            <span className="inline-block size-2 rounded-full bg-background/60" />
            {formatNumber(reach * 16)}
          </div>
          <div className="h-2 w-px bg-foreground/30" />
        </div>

        <Slider
          min={0}
          max={100}
          step={1}
          value={[reach]}
          onValueChange={([value]) => onReachChange(value ?? 0)}
          className="[&_[data-slot=slider-range]]:bg-green-500 [&_[data-slot=slider-thumb]]:border-green-500"
        />
      </div>

      <div className="mt-1 mb-5 flex justify-between text-xs text-muted-foreground">
        <span>Narrow</span>
        <span>Broad</span>
      </div>

      <div className="mb-4 flex items-center gap-0 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("weekly")}
          className={`relative mr-5 pb-2.5 text-sm font-medium transition-colors ${
            activeTab === "weekly"
              ? "text-foreground after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:rounded-full after:bg-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Weekly Results
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("daily")}
          className={`relative pb-2.5 text-sm font-medium transition-colors ${
            activeTab === "daily"
              ? "text-foreground after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:rounded-full after:bg-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Daily Results
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-0.5 flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Impressions</span>
            <HelpCircle size={13} className="text-muted-foreground" />
          </div>
          <p className="text-xl font-bold text-foreground">{displayedImpressions.toLocaleString()}</p>
        </div>
        <div>
          <div className="mb-0.5 flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Clicks</span>
            <HelpCircle size={13} className="text-muted-foreground" />
          </div>
          <p className="text-xl font-bold text-foreground">{displayedClicks.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
