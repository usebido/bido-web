"use client";

import { HelpCircle } from "lucide-react";
import type { CampaignFormData } from "@/lib/campaign-types";
import { useI18n } from "@/components/providers/i18n-provider";

interface AdInfoSectionProps {
  form: CampaignFormData;
  onChange: (updates: Partial<CampaignFormData>) => void;
}

export function AdInfoSection({ form, onChange }: AdInfoSectionProps) {
  const { messages } = useI18n();
  const t = messages.app.campaignForm.adInfo;
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="mb-0.5 text-lg font-semibold text-foreground">{t.title}</h2>
      <p className="mb-6 text-sm text-muted-foreground">{t.description}</p>

      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {t.brandName}
            <HelpCircle size={13} className="text-muted-foreground/70" />
          </label>
          <span className="text-xs text-muted-foreground">{form.brandName.length}/200</span>
        </div>
        <input
          type="text"
          maxLength={200}
          value={form.brandName}
          onChange={(e) => onChange({ brandName: e.target.value })}
          placeholder={t.brandPlaceholder}
          className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground transition-[box-shadow,border-color] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
        />
      </div>

      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {t.productDescriptionLabel}
            <HelpCircle size={13} className="text-muted-foreground/70" />
          </label>
          <span className="text-xs text-muted-foreground">
            {form.productDescription.length}/500
          </span>
        </div>
        <textarea
          maxLength={500}
          rows={4}
          value={form.productDescription}
          onChange={(e) => onChange({ productDescription: e.target.value })}
          placeholder={t.productDescriptionPlaceholder}
          className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground transition-[box-shadow,border-color] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-muted-foreground">{t.urlLabel}</label>
        <input
          type="url"
          value={form.destinationUrl}
          onChange={(e) => onChange({ destinationUrl: e.target.value })}
          placeholder={t.urlPlaceholder}
          className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground transition-[box-shadow,border-color] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
        />
      </div>
    </section>
  );
}
