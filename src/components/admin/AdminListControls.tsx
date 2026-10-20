import Link from "next/link";

interface SearchBoxProps {
  action: string;
  query: string;
  placeholder: string;
}

// Plain GET form: works without JavaScript and keeps the search in the URL.
export function AdminSearchBox({ action, query, placeholder }: SearchBoxProps) {
  return (
    <form action={action} className="flex max-w-md gap-2">
      <input
        name="q"
        defaultValue={query}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
      />
      <button type="submit" className="btn-3d px-4 py-2 text-sm">
        Search
      </button>
      {query && (
        <Link href={action} className="self-center text-sm font-semibold text-muted hover:text-ink">
          Clear
        </Link>
      )}
    </form>
  );
}

interface PaginationProps {
  basePath: string;
  page: number;
  totalPages: number;
  total: number;
  query: string;
}

export function AdminPagination({ basePath, page, totalPages, total, query }: PaginationProps) {
  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (p > 1) params.set("page", String(p));
    const search = params.toString();
    return search ? `${basePath}?${search}` : basePath;
  };
  const linkClass = "btn-3d px-3 py-1.5 text-sm";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
      <span>
        {total.toLocaleString("en-US")} results · page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className={linkClass}>
            ← Previous
          </Link>
        ) : (
          <span className={`${linkClass} opacity-40`}>← Previous</span>
        )}
        {page < totalPages ? (
          <Link href={hrefFor(page + 1)} className={linkClass}>
            Next →
          </Link>
        ) : (
          <span className={`${linkClass} opacity-40`}>Next →</span>
        )}
      </div>
    </div>
  );
}
