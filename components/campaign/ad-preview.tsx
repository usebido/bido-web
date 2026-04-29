"use client";

import { ChevronRight, Globe } from "lucide-react";
import type { CampaignFormData } from "@/lib/campaign-types";

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.replace("www.", "");
  } catch {
    return url || "yourdomain.com";
  }
}

function generateAdText(form: CampaignFormData): string {
  if (form.offerText.trim().length > 10) {
    return form.offerText.length > 120 ? `${form.offerText.slice(0, 120)}...` : form.offerText;
  }
  if (form.brandName.trim()) {
    return `Discover ${form.brandName} — built for you. Explore what makes us different today.`;
  }
  return "Step into comfort and style with The Best Shoe Company — your go-to for everyday shoes that feel as good as they look. Discover the difference today!";
}

function generateQuestion(form: CampaignFormData): string {
  if (form.brandName.trim()) {
    return `What are some options for ${form.brandName.toLowerCase()}?`;
  }
  return "What are some comfortable and stylish shoes for everyday wear?";
}

export function AdPreview({ form }: { form: CampaignFormData }) {
  const domain = extractDomain(form.destinationUrl);
  const adText = generateAdText(form);
  const question = generateQuestion(form);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 text-base font-semibold text-foreground">Preview</h3>

      <div className="mb-3 flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-muted px-4 py-3 text-sm leading-relaxed text-foreground">
          {question}
        </div>
      </div>

      <div className="mb-3">
        <button className="flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/80">
          AI Response
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="opacity-60">
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
        <div className="mb-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex size-4 items-center justify-center rounded-full bg-blue-400/30">
              <Globe size={9} className="text-blue-600" />
            </div>
            <span className="text-xs font-medium text-foreground">{domain}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Sponsored</span>
        </div>
        <p className="mb-3 text-xs leading-relaxed text-foreground">{adText}</p>
        <button className="flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/50">
          View more
          <ChevronRight size={11} />
        </button>
      </div>

      <p className="mt-2 text-right text-[11px] text-muted-foreground">
        Not your icon?{" "}
        <button className="underline underline-offset-2 transition-colors hover:text-foreground">
          Let us know
        </button>
      </p>
    </div>
  );
}
