// Keyset ("seek") paging for append-only logs ordered by an identity id, newest first: a page is "the 25
// rows older than id X" (or newer than X when going back), so every page costs the same index lookup
// and rows added meanwhile never shift what the learner or admin sees.

export interface KeysetCursor {
  before: number | null;
  after: number | null;
}

export interface KeysetPage<T> {
  rows: T[];
  // Ids to page from; null when there is nothing further that way.
  olderThan: number | null;
  newerThan: number | null;
}

function parseId(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && /^\d{1,18}$/.test(raw) ? Number(raw) : null;
}

export function parseKeysetCursor(sp: Record<string, string | string[] | undefined>): KeysetCursor {
  const before = parseId(sp.before);
  return { before, after: before === null ? parseId(sp.after) : null };
}

// The query reads one row more than a page to know whether another page exists. Going "newer" reads in
// ascending order, so those rows are flipped back to newest first.
export function toKeysetPage<T extends { id: number }>(fetched: T[], cursor: KeysetCursor, pageSize: number): KeysetPage<T> {
  const hasMore = fetched.length > pageSize;
  const rows = fetched.slice(0, pageSize);
  if (cursor.after !== null) rows.reverse();
  const first = rows[0];
  const last = rows.at(-1);
  const isGoingNewer = cursor.after !== null;
  return {
    rows,
    olderThan: last && (isGoingNewer || hasMore) ? last.id : null,
    newerThan: first && (isGoingNewer ? hasMore : cursor.before !== null) ? first.id : null,
  };
}
