"use client";

import { ChevronRight, Globe } from "lucide-react";
import type { CampaignFormData } from "@/lib/campaign-types";
import { useI18n } from "@/components/providers/i18n-provider";

function extractDomain(url: string, fallback: string): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.replace("www.", "");
  } catch {
    return url || fallback;
  }
}

export function AdPreview({ form }: { form: CampaignFormData }) {
  const { messages, replace } = useI18n();
  const t = messages.app.campaignForm.preview;

  const domain = extractDomain(form.destinationUrl, t.defaultDomain);

  const adText =
    form.offerText.trim().length > 10
      ? form.offerText.length > 120
        ? `${form.offerText.slice(0, 120)}...`
        : form.offerText
      : form.brandName.trim()
        ? replace(t.brandedAdText, { brand: form.brandName })
        : t.defaultAdText;

  const question = t.defaultQuestion;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 text-base font-semibold text-foreground">{t.title}</h3>

      <div className="mb-3 flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-muted px-4 py-3 text-sm leading-relaxed text-foreground">
          {question}
        </div>
      </div>

      <div className="mb-3">
        <button className="flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/80">
          {t.aiResponse}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="opacity-60">
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 dark:border-blue-500/20 dark:bg-blue-500/10">
        <div className="mb-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex size-4 items-center justify-center rounded-full bg-blue-400/30 dark:bg-blue-500/20">
              <Globe size={9} className="text-blue-600 dark:text-blue-300" />
            </div>
            <span className="text-xs font-medium text-foreground">{domain}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">{t.sponsored}</span>
        </div>
        <p className="mb-3 text-xs leading-relaxed text-foreground">{adText}</p>
        <button className="flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/50 dark:bg-card dark:hover:bg-muted/40">
          {t.viewMore}
          <ChevronRight size={11} />
        </button>
      </div>

      <p className="mt-2 text-right text-[11px] text-muted-foreground">
        {t.notYourIcon}{" "}
        <button className="underline underline-offset-2 transition-colors hover:text-foreground">
          {t.letUsKnow}
        </button>
      </p>
    </div>
  );
}
