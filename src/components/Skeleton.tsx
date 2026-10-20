// Loading placeholders that keep the layout steady instead of a bare "Loading..." line.

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="mt-8 space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 rounded-3xl border border-line bg-surface p-4">
          <div className="size-12 shrink-0 rounded-2xl bg-line" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded-full bg-line" />
            <div className="h-3 w-1/2 rounded-full bg-line/70" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LessonSkeleton() {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-7xl animate-pulse flex-col" aria-busy="true" aria-label="Preparing your lesson">
      <div className="flex items-center gap-3 border-b border-line px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <div className="size-10 rounded-full bg-line" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/2 rounded-full bg-line" />
          <div className="h-3 w-1/4 rounded-full bg-line/70" />
        </div>
      </div>
      <div className="aspect-video w-full bg-line lg:mx-6 lg:mt-6 lg:w-auto lg:max-w-3xl lg:rounded-3xl" />
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="space-y-2 rounded-2xl p-2">
            <div className="h-4 w-11/12 rounded-full bg-line" />
            <div className="h-4 w-3/5 rounded-full bg-line/70" />
          </div>
        ))}
      </div>
    </div>
  );
}
