import { z } from "zod";

export const transcriptTurnSchema = z.object({
  speaker: z.string().min(1).nullable(),
  paragraphs: z.array(z.string().min(1)).min(1),
});

/** `src/data/transcripts.json`, written by `npm run sync:transcripts`. Keyed by episode slug. */
export const transcriptSnapshotSchema = z.record(
  z.string(),
  z.object({
    sourceUrl: z.url(),
    turns: z.array(transcriptTurnSchema).min(1),
  }),
);

export type TranscriptSnapshot = z.infer<typeof transcriptSnapshotSchema>;
