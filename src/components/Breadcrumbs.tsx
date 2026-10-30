import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  // The trail after Home; the last item is the current page.
  items: Crumb[];
  className?: string;
}

export function Breadcrumbs({ items, className = "mb-3" }: BreadcrumbsProps) {
  const trail: Crumb[] = [{ label: "Home", href: "/" }, ...items];
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1;
          return (
            <li key={`${crumb.label}-${i}`} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && (
                <span aria-hidden="true" className="text-muted">
                  ›
                </span>
              )}
              {crumb.href && !isLast ? (
                <Link href={crumb.href} className="-my-2 inline-block py-2 font-semibold text-brand hover:text-brand-dark">
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className="max-w-[14rem] truncate text-muted sm:max-w-sm">
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
