"use client";

import { HelpCircle } from "lucide-react";
import type { CampaignFormData } from "@/lib/campaign-types";

interface BudgetSectionProps {
  form: CampaignFormData;
  onChange: (updates: Partial<CampaignFormData>) => void;
}

export function BudgetSection({ form, onChange }: BudgetSectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="mb-0.5 text-lg font-semibold text-foreground">3. Orçamento &amp; Lances</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Defina quanto investir para aparecer nas respostas.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            Orçamento Total
            <HelpCircle size={13} className="text-muted-foreground/70" />
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">$</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.totalBudget}
              onChange={(e) => onChange({ totalBudget: Number.parseFloat(e.target.value) || 0 })}
              className="h-10 w-full rounded-lg border border-input bg-background pr-3 pl-7 text-right text-sm text-foreground transition-[box-shadow,border-color] focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            Lance Máximo por Recomendação
            <HelpCircle size={13} className="text-muted-foreground/70" />
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">$</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.queryBid}
              onChange={(e) => onChange({ queryBid: Number.parseFloat(e.target.value) || 0 })}
              className="h-10 w-full rounded-lg border border-input bg-background pr-3 pl-7 text-right text-sm text-foreground transition-[box-shadow,border-color] focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
