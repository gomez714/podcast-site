import type { SourceEpisode } from "./types";

/** Accepts integer seconds ("1339") or clock values ("22:19", "1:02:03"). */
export function parseDurationSeconds(value: string | undefined): number | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;

  if (/^\d+$/.test(raw)) {
    const seconds = Number(raw);
    return seconds > 0 ? seconds : undefined;
  }

  const clock = /^(?:(\d+):)?([0-5]?\d):([0-5]\d)$/.exec(raw);
  if (!clock) return undefined;

  const [, hours = "0", minutes, seconds] = clock;
  const total = Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
  return total > 0 ? total : undefined;
}

/** Returns an ISO 8601 UTC string, or undefined when the date is missing or unparseable. */
export function parsePublishedAt(value: string | undefined): string | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;

  const time = Date.parse(raw);
  return Number.isNaN(time) ? undefined : new Date(time).toISOString();
}

export function parseExplicit(value: string | undefined): boolean {
  const raw = value?.trim().toLowerCase();
  return raw === "true" || raw === "yes" || raw === "explicit";
}

export function parsePositiveInt(value: string | undefined): number | undefined {
  const raw = value?.trim();
  if (!raw || !/^\d+$/.test(raw)) return undefined;

  const number = Number(raw);
  return Number.isSafeInteger(number) && number > 0 ? number : undefined;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const codePoint =
        entity[1] === "x" || entity[1] === "X"
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10);
      return Number.isFinite(codePoint) && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : match;
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

export function redactEmails(text: string): string {
  return text.replace(EMAIL_PATTERN, "[email removed]");
}

/** Converts feed HTML into plain text for display as text (never as HTML). */
export function htmlToPlainText(html: string): string {
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "");

  return decodeEntities(withBreaks.replace(/<[^>]*>/g, ""))
    .split("\n")
    .map((line) => line.replace(/[ \t\u00a0]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Newest first; ties broken by higher episode number, then GUID, so order never depends on feed order. */
export function compareEpisodesNewestFirst(a: SourceEpisode, b: SourceEpisode): number {
  const byDate = Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
  if (byDate !== 0) return byDate;

  const byNumber = (b.episodeNumber ?? -1) - (a.episodeNumber ?? -1);
  if (byNumber !== 0) return byNumber;

  return a.sourceGuid.localeCompare(b.sourceGuid);
}
