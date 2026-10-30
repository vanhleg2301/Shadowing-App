import Link from "next/link";

interface PartNavProps {
  index: number;
  total: number;
  href: (index: number) => string;
  isOver: boolean;
  className?: string;
}

// Moves between the ~5-minute parts of a long video.
export function PartNav({ index, total, href, isOver, className = "mb-3" }: PartNavProps) {
  const hasNext = index < total;
  return (
    <div
      className={`${className} flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm ${
        isOver ? "animate-fade-in border-accent/40 bg-accent-soft" : "border-line bg-surface"
      }`}
    >
      <span className="min-w-0 flex-1 text-ink">
        {isOver ? (
          <b>{hasNext ? `Part ${index} done. Ready for the next one?` : "Last part done!"}</b>
        ) : (
          <>
            Part <b>{index}</b> of {total} · about 5 minutes
          </>
        )}
      </span>
      {index > 1 && (
        <Link href={href(index - 1)} className="btn-3d shrink-0 px-3 py-1.5 text-sm">
          Back
        </Link>
      )}
      {hasNext && (
        <Link href={href(index + 1)} className={`btn-3d shrink-0 px-3 py-1.5 text-sm ${isOver ? "btn-brand" : ""}`}>
          Next part
        </Link>
      )}
    </div>
  );
}
