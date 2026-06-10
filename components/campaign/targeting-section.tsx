"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CampaignFormData } from "@/lib/campaign-types";
import { useI18n } from "@/components/providers/i18n-provider";

interface TargetingSectionProps {
  form: CampaignFormData;
  onChange: (updates: Partial<CampaignFormData>) => void;
}

export function TargetingSection({ form, onChange }: TargetingSectionProps) {
  const { messages } = useI18n();
  const t = messages.app.campaignForm.targeting;
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="mb-0.5 text-lg font-semibold text-foreground">{t.title}</h2>
      <p className="mb-6 text-sm text-muted-foreground">{t.description}</p>

      <div>
        <label className="mb-1.5 block text-sm text-muted-foreground">{t.categoryLabel}</label>
        <Select value={form.intentCategory} onValueChange={(value) => onChange({ intentCategory: value })}>
          <SelectTrigger className="h-10 w-full rounded-lg">
            <SelectValue placeholder={t.categoryPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="travel">{t.categories.travel}</SelectItem>
            <SelectItem value="ecommerce">{t.categories.ecommerce}</SelectItem>
            <SelectItem value="crypto">{t.categories.crypto}</SelectItem>
          </SelectContent>
        </Select>
        <p className="mt-2 text-sm text-muted-foreground">{t.categoryHelp}</p>
      </div>
    </section>
  );
}
