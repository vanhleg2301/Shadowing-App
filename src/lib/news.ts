// Dates are formatted on the server so the page and the browser never disagree about the time zone.
export function formatNewsDate(publishedAt: string | undefined): string | null {
  if (!publishedAt) return null;
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
