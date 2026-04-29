type ComparisonItem = {
  label: string;
  value: number;
};

export function MiniStatChart({
  label,
  value,
  color,
  items,
  formatter,
}: {
  label: string;
  value: string | number;
  color: string;
  items: ComparisonItem[];
  formatter: (value: number) => string;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="px-6 pt-5 pb-3">
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold tabular-nums text-foreground">{value}</p>
      </div>

      <div className="space-y-3 px-6 pb-6">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="text-sm font-medium tabular-nums text-foreground">{formatter(item.value)}</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full transition-[width]"
                style={{ width: `${(item.value / max) * 100}%`, backgroundColor: color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
