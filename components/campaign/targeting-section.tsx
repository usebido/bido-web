"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CampaignFormData } from "@/lib/campaign-types";

interface TargetingSectionProps {
  form: CampaignFormData;
  onChange: (updates: Partial<CampaignFormData>) => void;
}

export function TargetingSection({ form, onChange }: TargetingSectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="mb-0.5 text-lg font-semibold text-foreground">2. Onde Quer Aparecer?</h2>
      <p className="mb-6 text-sm text-muted-foreground">Escolha em quais intenções sua campanha pode participar.</p>

      <div>
        <label className="mb-1.5 block text-sm text-muted-foreground">Categoria de Intenção</label>
        <Select value={form.intentCategory} onValueChange={(value) => onChange({ intentCategory: value })}>
          <SelectTrigger className="h-10 w-full rounded-lg">
            <SelectValue placeholder="Selecionar categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="viagens">Viagens</SelectItem>
            <SelectItem value="ecommerce">E-commerce</SelectItem>
            <SelectItem value="saas">SaaS</SelectItem>
            <SelectItem value="financas">Finanças</SelectItem>
            <SelectItem value="educacao">Educação</SelectItem>
          </SelectContent>
        </Select>
        <p className="mt-2 text-sm text-muted-foreground">
          Ex: Viagens, E-commerce, SaaS, Finanças, Educação
        </p>
      </div>
    </section>
  );
}
