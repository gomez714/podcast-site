import { transcriptEdits, transcriptHostName, type TranscriptEdits } from "@/content/transcripts";
import transcripts from "@/data/transcripts.json";

import type { TranscriptTurn } from "../transcripts/parse";
import { transcriptSnapshotSchema, type TranscriptSnapshot } from "../transcripts/schema";
import { EpisodeInventoryError } from "./inventory";

/** A turn ready to render: the display name (null in solo episodes) and whether it's the host. */
export type TranscriptViewTurn = { speaker: string | null; isHost: boolean; paragraphs: string[] };

/**
 * Applies the host's speaker names and corrections (`src/content/transcripts.ts`) to every synced
 * transcript. Throws on any mismatch, like the episode repository, so an unmapped speaker, a
 * correction that no longer matches, or a transcript without edits fails the build.
 */
export function buildTranscriptViews(
  snapshot: TranscriptSnapshot,
  edits: Readonly<Record<string, TranscriptEdits>>,
): Map<string, TranscriptViewTurn[]> {
  const problems: string[] = [];
  const views = new Map<string, TranscriptViewTurn[]>();

  for (const slug of Object.keys(edits)) {
    if (!snapshot[slug]) {
      problems.push(`Transcript edits for "${slug}" have no synced transcript.`);
    }
  }

  for (const [slug, { turns }] of Object.entries(snapshot)) {
    const entry = edits[slug];
    if (!entry) {
      problems.push(`Transcript for "${slug}" has no entry in src/content/transcripts.ts.`);
      continue;
    }
    views.set(slug, applyEdits(slug, turns, entry, problems));
  }

  if (problems.length > 0) throw new EpisodeInventoryError(problems);
  return views;
}

function applyEdits(
  slug: string,
  turns: readonly TranscriptTurn[],
  { speakers, corrections = [] }: TranscriptEdits,
  problems: string[],
): TranscriptViewTurn[] {
  const uses = corrections.map(() => 0);

  const view = turns.map((turn) => {
    let speaker: string | null = null;
    if (turn.speaker !== null) {
      speaker = speakers[turn.speaker] ?? null;
      if (speaker === null) {
        problems.push(`Transcript "${slug}" has speaker "${turn.speaker}" with no display name.`);
      }
    }

    const paragraphs = turn.paragraphs.map((paragraph) =>
      corrections.reduce((text, [from, to], i) => {
        const parts = text.split(from);
        uses[i] += parts.length - 1;
        return parts.join(to);
      }, paragraph),
    );

    return { speaker, isHost: speaker === transcriptHostName, paragraphs };
  });

  corrections.forEach(([from], i) => {
    if (uses[i] === 0)
      problems.push(`Transcript "${slug}": correction "${from}" no longer matches.`);
  });

  return view;
}

/**
 * Roughly how much of the conversation the episode page's Transcript tab shows (host's choice,
 * Oct 29, 2026). Counted in words, not turns: a turn can be one "Mm-hmm" or several minutes of
 * talk, so a fixed 12 turns ranged from 421 to 2,899 words across the episodes.
 */
export const TRANSCRIPT_PREVIEW_WORDS = 200;

/** The opening paragraphs up to about `words`, ending at a whole paragraph (mid-turn if needed). */
export function transcriptPreview(
  turns: readonly TranscriptViewTurn[],
  words = TRANSCRIPT_PREVIEW_WORDS,
): TranscriptViewTurn[] {
  const preview: TranscriptViewTurn[] = [];
  let count = 0;
  for (const turn of turns) {
    const paragraphs: string[] = [];
    for (const paragraph of turn.paragraphs) {
      paragraphs.push(paragraph);
      count += paragraph.split(/\s+/).filter(Boolean).length;
      if (count >= words) break;
    }
    preview.push({ ...turn, paragraphs });
    if (count >= words) break;
  }
  return preview;
}

let cache: Map<string, TranscriptViewTurn[]> | undefined;

/** The episode's transcript as speaker turns, or undefined if it has none. */
export function getEpisodeTranscript(slug: string): TranscriptViewTurn[] | undefined {
  cache ??= buildTranscriptViews(transcriptSnapshotSchema.parse(transcripts), transcriptEdits);
  return cache.get(slug);
}
