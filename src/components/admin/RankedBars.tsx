import Link from "next/link";

interface RankedBarsProps {
  title: string;
  subtitle: string;
  emptyText: string;
  items: { label: string; value: number; href?: string }[];
}

const BAR_COLOR = "#0f8f7c";

// Ranked list as horizontal bars: label above, bar from a shared baseline, value at the tip in text ink.
export function RankedBars({ title, subtitle, emptyText, items }: RankedBarsProps) {
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <figure className="rounded-3xl border border-line bg-surface p-5">
      <figcaption>
        <p className="font-bold text-ink">{title}</p>
        <p className="text-sm text-muted">{subtitle}</p>
      </figcaption>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{emptyText}</p>
      ) : (
        <ol className="mt-4 space-y-2.5">
          {items.map((item) => (
            <li key={item.label} title={`${item.label}: ${item.value}`}>
              <p className="truncate text-sm text-ink">
                {item.href ? (
                  <Link href={item.href} className="hover:text-brand">
                    {item.label}
                  </Link>
                ) : (
                  item.label
                )}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <div
                  className="h-3 rounded-r-[4px]"
                  style={{ width: `${(item.value / max) * 85}%`, minWidth: 4, background: BAR_COLOR }}
                />
                <span className="text-xs font-semibold text-muted">{item.value}</span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </figure>
  );
}
