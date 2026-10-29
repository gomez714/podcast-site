import { htmlToPlainText, redactEmails } from "../episodes/normalize";

/** One person's turn. `speaker` is the raw label from the transcript, or null when it has none. */
export type TranscriptTurn = { speaker: string | null; paragraphs: string[] };

/** Riverside exports: a paragraph that is only "Name (mm:ss.ms)" starts that person's turn. */
const RIVERSIDE_LABEL = /^([^()]{1,40}?) \((?:\d+:)?\d{1,2}:\d{2}(?:\.\d+)?\)$/;

/** "Name: text" exports. Only labels used several times count, so a stray colon isn't a speaker. */
const PREFIX_LABEL = /^([A-Za-z][A-Za-z .'-]{0,38}): (.*)$/;
const MIN_PREFIX_USES = 3;

/** Inline time markers like "[00:01:00]". They're dropped: Fusebox's times don't match the audio. */
const TIME_MARKER = /\[\d{2}:\d{2}:\d{2}\]\s*/g;

/**
 * Turns a Fusebox transcript (an HTML fragment of `<p>` paragraphs) into speaker turns of plain
 * text. Handles the three shapes the show's transcripts come in: Riverside label paragraphs,
 * "Name: text" prefixes, and unlabelled solo episodes. Consecutive paragraphs from the same
 * speaker are merged into one turn. Text is never kept as HTML, and email addresses are removed.
 */
export function parseTranscriptHtml(html: string): TranscriptTurn[] {
  const paragraphs = htmlToPlainText(html)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const prefixUses = new Map<string, number>();
  for (const paragraph of paragraphs) {
    const label = PREFIX_LABEL.exec(paragraph)?.[1];
    if (label) prefixUses.set(label, (prefixUses.get(label) ?? 0) + 1);
  }

  const turns: TranscriptTurn[] = [];
  let current: TranscriptTurn | undefined;

  const startTurn = (speaker: string | null): TranscriptTurn => {
    if (current?.speaker === speaker) return current;
    current = { speaker, paragraphs: [] };
    turns.push(current);
    return current;
  };

  for (const paragraph of paragraphs) {
    const riverside = RIVERSIDE_LABEL.exec(paragraph);
    if (riverside) {
      startTurn(riverside[1].trim());
      continue;
    }

    let speaker = current?.speaker ?? null;
    let text = paragraph;
    const prefix = PREFIX_LABEL.exec(paragraph);
    if (prefix && (prefixUses.get(prefix[1]) ?? 0) >= MIN_PREFIX_USES) {
      speaker = prefix[1].trim();
      text = prefix[2];
    }

    text = redactEmails(text.replace(TIME_MARKER, "")).trim();
    if (text) startTurn(speaker).paragraphs.push(text);
  }

  return turns.filter((turn) => turn.paragraphs.length > 0);
}

export function countWords(turns: readonly TranscriptTurn[]): number {
  return turns.reduce(
    (total, turn) => total + turn.paragraphs.join(" ").split(/\s+/).filter(Boolean).length,
    0,
  );
}
