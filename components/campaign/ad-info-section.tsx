"use client";

import { HelpCircle } from "lucide-react";
import type { CampaignFormData } from "@/lib/campaign-types";

interface AdInfoSectionProps {
  form: CampaignFormData;
  onChange: (updates: Partial<CampaignFormData>) => void;
}

export function AdInfoSection({ form, onChange }: AdInfoSectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="mb-0.5 text-lg font-semibold text-foreground">1. Sua Oferta</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Usamos essas informações para gerar recomendações patrocinadas.
      </p>

      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Nome da Marca / Produto
            <HelpCircle size={13} className="text-muted-foreground/70" />
          </label>
          <span className="text-xs text-muted-foreground">{form.brandName.length}/200</span>
        </div>
        <input
          type="text"
          maxLength={200}
          value={form.brandName}
          onChange={(e) => onChange({ brandName: e.target.value })}
          placeholder="Ex: Delta Airlines"
          className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground transition-[box-shadow,border-color] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
        />
      </div>

      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Oferta que deseja aparecer
            <HelpCircle size={13} className="text-muted-foreground/70" />
          </label>
          <span className="text-xs text-muted-foreground">{form.offerText.length}/500</span>
        </div>
        <textarea
          maxLength={500}
          rows={4}
          value={form.offerText}
          onChange={(e) => onChange({ offerText: e.target.value })}
          placeholder="Ex: R$300 OFF, bagagem grátis, entrega em 24h, teste grátis por 30 dias."
          className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground transition-[box-shadow,border-color] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-muted-foreground">URL de Destino</label>
        <input
          type="url"
          value={form.destinationUrl}
          onChange={(e) => onChange({ destinationUrl: e.target.value })}
          placeholder="https://www.seusite.com"
          className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground transition-[box-shadow,border-color] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
        />
      </div>
    </section>
  );
}
