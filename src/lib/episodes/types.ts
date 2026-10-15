import type { z } from "zod";

import type {
  episodeSchema,
  episodeSnapshotSchema,
  showSchema,
  sourceEpisodeSchema,
} from "./schema";

/** Episode metadata exactly as normalized from the RSS feed, before editorial data is joined. */
export type SourceEpisode = z.infer<typeof sourceEpisodeSchema>;

/** Source episode plus its reviewed, stable public slug. */
export type Episode = z.infer<typeof episodeSchema>;

export type Show = z.infer<typeof showSchema>;

export type EpisodeSnapshot = z.infer<typeof episodeSnapshotSchema>;

export type FeedIssue = {
  severity: "error" | "warning";
  itemIndex?: number;
  sourceGuid?: string;
  field: string;
  message: string;
};
