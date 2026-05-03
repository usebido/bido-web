"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Table } from "@/components/ui/table";
import { ShimmerBlock } from "@/components/ui/animated-loading-skeleton";
import { useCampaigns } from "@/lib/hooks/use-campaigns";
import { useI18n } from "@/components/providers/i18n-provider";

export function AppCampaignsScreen() {
  const { formatCurrency, formatDate, messages, replace } = useI18n();
  const { campaigns, loading, error } = useCampaigns();
  const t = messages.app.campaignsList;

  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">{t.title}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{t.subtitle}</p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-3 sm:p-5">
        {error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        <Table>
          <Table.Colgroup>
            <Table.Col className="w-[28%]" />
            <Table.Col className="w-[12%]" />
            <Table.Col className="w-[14%]" />
            <Table.Col className="w-[14%]" />
            <Table.Col className="w-[10%]" />
            <Table.Col className="w-[14%]" />
            <Table.Col className="w-[8%]" />
          </Table.Colgroup>
          <Table.Header>
            <Table.Row>
              <Table.Head>{t.headers.campaign}</Table.Head>
              <Table.Head>{t.headers.category}</Table.Head>
              <Table.Head>{t.headers.budget}</Table.Head>
              <Table.Head>{t.headers.spend}</Table.Head>
              <Table.Head>{t.headers.ctd}</Table.Head>
              <Table.Head>{t.headers.updated}</Table.Head>
              <Table.Head>{t.headers.open}</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body interactive striped>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <Table.Row key={`skeleton-${i}`}>
                    <Table.Cell>
                      <ShimmerBlock className="h-4 w-40 rounded" />
                    </Table.Cell>
                    <Table.Cell>
                      <ShimmerBlock className="h-4 w-20 rounded" />
                    </Table.Cell>
                    <Table.Cell>
                      <ShimmerBlock className="h-4 w-24 rounded" />
                    </Table.Cell>
                    <Table.Cell>
                      <ShimmerBlock className="h-4 w-24 rounded" />
                    </Table.Cell>
                    <Table.Cell>
                      <ShimmerBlock className="h-4 w-12 rounded" />
                    </Table.Cell>
                    <Table.Cell>
                      <ShimmerBlock className="h-4 w-20 rounded" />
                    </Table.Cell>
                    <Table.Cell>
                      <ShimmerBlock className="h-4 w-10 rounded" />
                    </Table.Cell>
                  </Table.Row>
                ))
              : null}
            {campaigns.map((campaign) => (
              <Table.Row key={campaign.id}>
                <Table.Cell>
                  <Link href={`/app/campaigns/${campaign.id}`} className="block">
                    <div className="font-semibold text-foreground">{campaign.name}</div>
                  </Link>
                </Table.Cell>
                <Table.Cell>{campaign.segment}</Table.Cell>
                <Table.Cell>{formatCurrency(campaign.remainingBudget)}</Table.Cell>
                <Table.Cell>{formatCurrency(campaign.spend)}</Table.Cell>
                <Table.Cell>{campaign.ctd.toFixed(0)}</Table.Cell>
                <Table.Cell>{formatDate(campaign.updatedAt, { dateStyle: "medium" })}</Table.Cell>
                <Table.Cell>
                  <Link
                    href={`/app/campaigns/${campaign.id}`}
                    className="inline-flex items-center gap-1 font-medium text-foreground transition-opacity hover:opacity-70"
                  >
                    {t.open}
                    <ChevronRight className="size-4" />
                  </Link>
                </Table.Cell>
              </Table.Row>
            ))}
            {!loading && campaigns.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  {t.empty}
                </Table.Cell>
              </Table.Row>
            ) : null}
          </Table.Body>
          <Table.Footer>
            <Table.Row>
              <Table.Cell className="font-medium text-foreground" colSpan={2}>
                {replace(t.footerCount, { count: campaigns.length })}
              </Table.Cell>
              <Table.Cell className="font-medium text-foreground">
                {formatCurrency(campaigns.reduce((sum, campaign) => sum + campaign.remainingBudget, 0))}
              </Table.Cell>
              <Table.Cell className="font-medium text-foreground">
                {formatCurrency(campaigns.reduce((sum, campaign) => sum + campaign.spend, 0))}
              </Table.Cell>
              <Table.Cell className="font-medium text-foreground">
                {campaigns.reduce((sum, campaign) => sum + campaign.ctd, 0).toFixed(0)}
              </Table.Cell>
              <Table.Cell colSpan={2}> </Table.Cell>
            </Table.Row>
          </Table.Footer>
        </Table>
      </section>
    </>
  );
}
