const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** "Jan 2, 2024". Formatted in UTC so server and client always agree. */
export function formatEpisodeDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}

/** "55 min", rounded to the nearest minute. */
export function formatDuration(seconds: number): string {
  return `${Math.max(1, Math.round(seconds / 60))} min`;
}
