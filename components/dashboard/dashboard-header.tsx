import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import Link from "next/link";
import { Plus } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
          Dashboard
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Campaign performance overview</p>
      </div>

      <div className="flex items-center gap-3">
        <DateRangePicker />
        <Link
          href="/app/campaigns/new"
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus size={15} strokeWidth={2.5} />
          Create Campaign
        </Link>
      </div>
    </header>
  );
}
