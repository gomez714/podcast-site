export type Chapter = { startSeconds: number; title: string };

export type ShowNotes = {
  /** The published description, without headings, links or contact lines. */
  paragraphs: string[];
  /** The host's own "Takeaways" bullets, when the notes have them. */
  takeaways: string[];
  /** Timestamps from the notes. They follow the audio, not the filmed edit. */
  chapters: Chapter[];
};

const SHOW_LINK_LINE = /^(website|youtube|patreon|instagram|tiktok)\s*:/i;
const DIVIDER = /^-{3,}$/;
const TAKEAWAYS_HEADING = /^(key\s+)?takeaways:?$/i;
const CHAPTERS_HEADING = /^chapters:?$/i;
const TIMESTAMP = /^\[?((?:\d{1,2}:)?\d{1,2}:\d{2})\]?\s+(.+)$/;
const BULLET = /^[-•]\s*(.+)$/;
/** Links, handles and emails need a manual check before they're published (spec §9.1, §12.6). */
const CONTACT_DETAILS = /https?:\/\/|www\.|@\w|\[email/i;

export function parseTimestamp(value: string): number {
  return value
    .split(":")
    .map(Number)
    .reduce((total, part) => total * 60 + part, 0);
}

/**
 * Splits the feed's plain-text show notes into description, takeaways and chapters (spec §5.3).
 * Everything after the description that isn't a takeaway or chapter is a guest contact or show
 * footer line, and is dropped. Chapters are dropped entirely if any time is out of order or past
 * the end of the episode, so a typo can't send a listener to the wrong moment.
 */
export function parseShowNotes(text: string, durationSeconds?: number): ShowNotes {
  const paragraphs: string[] = [];
  const takeaways: string[] = [];
  const chapters: Chapter[] = [];
  let section: "description" | "takeaways" | "chapters" | "after" = "description";
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) paragraphs.push(paragraph.join(" "));
    paragraph = [];
  };

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      continue;
    }
    if (TAKEAWAYS_HEADING.test(line)) {
      flushParagraph();
      section = "takeaways";
      continue;
    }
    if (CHAPTERS_HEADING.test(line)) {
      flushParagraph();
      section = "chapters";
      continue;
    }
    if (DIVIDER.test(line) || SHOW_LINK_LINE.test(line)) {
      flushParagraph();
      if (section === "description") section = "after";
      continue;
    }

    const timestamp = TIMESTAMP.exec(line);
    if (timestamp) {
      flushParagraph();
      section = "chapters";
      chapters.push({ startSeconds: parseTimestamp(timestamp[1]), title: timestamp[2].trim() });
      continue;
    }
    const bullet = BULLET.exec(line);
    if (bullet && section === "takeaways") {
      takeaways.push(bullet[1].trim());
      continue;
    }
    if (section === "description" && !CONTACT_DETAILS.test(line)) paragraph.push(line);
  }
  flushParagraph();

  return {
    paragraphs,
    takeaways,
    chapters: chaptersAreValid(chapters, durationSeconds) ? chapters : [],
  };
}

function chaptersAreValid(chapters: Chapter[], durationSeconds?: number): boolean {
  return chapters.every(
    (chapter, i) =>
      (i === 0 || chapter.startSeconds > chapters[i - 1].startSeconds) &&
      (durationSeconds === undefined || chapter.startSeconds < durationSeconds),
  );
}
