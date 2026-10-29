import Link from "next/link";

interface PageNavProps {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}

// Numbered pages kept in the URL, so a page can be shared and the back button works.
// Shows the first, last and nearby pages, with gaps as "…".
export function PageNav({ page, totalPages, hrefFor }: PageNavProps) {
  if (totalPages <= 1) return null;
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const base = "grid h-10 min-w-10 place-items-center rounded-xl px-3 text-sm font-bold";

  return (
    <nav aria-label="Pages" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className={`btn-3d ${base}`} aria-label="Previous page">
          ←
        </Link>
      )}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && p - pages[i - 1] > 1 && <span className="text-muted">…</span>}
          {p === page ? (
            <span aria-current="page" className={`${base} bg-brand text-on-brand`}>
              {p}
            </span>
          ) : (
            <Link href={hrefFor(p)} className={`btn-3d ${base}`}>
              {p}
            </Link>
          )}
        </span>
      ))}
      {page < totalPages && (
        <Link href={hrefFor(page + 1)} className={`btn-3d ${base}`} aria-label="Next page">
          →
        </Link>
      )}
    </nav>
  );
}
