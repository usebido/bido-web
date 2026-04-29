"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Table } from "@/components/ui/table";
import { useCampaigns } from "@/lib/campaign-store";
import { useI18n } from "@/components/providers/i18n-provider";

export function AppCampaignsScreen() {
  const { formatCurrency, formatDate } = useI18n();
  const campaigns = useCampaigns();

  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">Campanhas</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Access a specific campaign and monitor status, budget and CTR.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-3 sm:p-5">
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
              <Table.Head>Campanha</Table.Head>
              <Table.Head>Categoria</Table.Head>
              <Table.Head>Budget</Table.Head>
              <Table.Head>Gasto</Table.Head>
              <Table.Head>CTD</Table.Head>
              <Table.Head>Atualizada</Table.Head>
              <Table.Head>Abrir</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body interactive striped>
            {campaigns.map((campaign) => (
              <Table.Row key={campaign.id}>
                <Table.Cell>
                  <Link href={`/app/campaigns/${campaign.id}`} className="block">
                    <div className="font-semibold text-foreground">{campaign.name}</div>
                  </Link>
                </Table.Cell>
                <Table.Cell>{campaign.segment}</Table.Cell>
                <Table.Cell>{formatCurrency(campaign.monthlyBudget)}</Table.Cell>
                <Table.Cell>{formatCurrency(campaign.spend)}</Table.Cell>
                <Table.Cell>{campaign.ctd.toFixed(1)}%</Table.Cell>
                <Table.Cell>{formatDate(campaign.updatedAt, { dateStyle: "medium" })}</Table.Cell>
                <Table.Cell>
                  <Link
                    href={`/app/campaigns/${campaign.id}`}
                    className="inline-flex items-center gap-1 font-medium text-foreground transition-opacity hover:opacity-70"
                  >
                    Ver
                    <ChevronRight className="size-4" />
                  </Link>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
          <Table.Footer>
            <Table.Row>
              <Table.Cell className="font-medium text-foreground" colSpan={2}>
                {campaigns.length} campanhas cadastradas
              </Table.Cell>
              <Table.Cell className="font-medium text-foreground">
                {formatCurrency(campaigns.reduce((sum, campaign) => sum + campaign.monthlyBudget, 0))}
              </Table.Cell>
              <Table.Cell className="font-medium text-foreground">
                {formatCurrency(campaigns.reduce((sum, campaign) => sum + campaign.spend, 0))}
              </Table.Cell>
              <Table.Cell className="font-medium text-foreground">
                {campaigns.length
                  ? (campaigns.reduce((sum, campaign) => sum + campaign.ctd, 0) / campaigns.length).toFixed(1)
                  : "0.0"}
                %
              </Table.Cell>
              <Table.Cell colSpan={2} />
            </Table.Row>
          </Table.Footer>
        </Table>
      </section>
    </>
  );
}
