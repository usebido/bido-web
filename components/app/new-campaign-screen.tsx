"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdInfoSection } from "@/components/campaign/ad-info-section";
import { TargetingSection } from "@/components/campaign/targeting-section";
import { BudgetSection } from "@/components/campaign/budget-section";
import { AdPreview } from "@/components/campaign/ad-preview";
import { INITIAL_FORM, type CampaignFormData } from "@/lib/campaign-types";
import { useCampaignActions } from "@/lib/campaign-store";

export function NewCampaignScreen({
  mode = "create",
  campaignId,
  initialForm = INITIAL_FORM,
}: {
  mode?: "create" | "edit";
  campaignId?: string;
  initialForm?: CampaignFormData;
}) {
  const router = useRouter();
  const { createCampaign, editCampaign } = useCampaignActions();
  const [form, setForm] = useState<CampaignFormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleChange(updates: Partial<CampaignFormData>) {
    setForm((prev) => ({ ...prev, ...updates }));
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
    if (mode === "edit" && campaignId) {
      await editCampaign(campaignId, form);
      router.push(`/app/campaigns/${campaignId}`);
      return;
    }

      const created = await createCampaign(form);
      router.push(`/app/campaigns/${created.id}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to save campaign.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <header className="mb-8 flex items-center gap-3">
        <Link
          href={mode === "edit" && campaignId ? `/app/campaigns/${campaignId}` : "/app"}
          className="flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {mode === "edit" ? "Editar Campanha" : "Criar Nova Campanha"}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {mode === "edit"
              ? "Atualize os dados abaixo para ajustar como sua campanha aparece nas respostas de IA."
              : "Preencha os dados abaixo para aparecer em respostas de IA no momento certo."}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">
          <AdInfoSection form={form} onChange={handleChange} />
          <TargetingSection form={form} onChange={handleChange} />
          <BudgetSection form={form} onChange={handleChange} />

          {submitError ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {submitError}
            </div>
          ) : null}

          <div className="flex items-center justify-between py-4">
            <Link
              href={mode === "edit" && campaignId ? `/app/campaigns/${campaignId}` : "/app"}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              {isSubmitting
                ? "Salvando..."
                : mode === "edit"
                  ? "Salvar Alterações"
                  : "Lançar Campanha"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:sticky lg:top-8">
          <AdPreview form={form} />
        </div>
      </div>
    </>
  );
}
