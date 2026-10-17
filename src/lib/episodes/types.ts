import type { z } from "zod";

import type {
  episodeEditorialSchema,
  episodeSchema,
  episodeSnapshotSchema,
  episodeThumbnailSchema,
  showSchema,
  sourceEpisodeSchema,
} from "./schema";
import type { ShowNotes } from "./show-notes";

/** Episode metadata exactly as normalized from the RSS feed, before editorial data is joined. */
export type SourceEpisode = z.infer<typeof sourceEpisodeSchema>;

/** Source episode plus its reviewed, stable public slug. */
export type Episode = z.infer<typeof episodeSchema>;

export type Show = z.infer<typeof showSchema>;

export type EpisodeSnapshot = z.infer<typeof episodeSnapshotSchema>;

export type EpisodeEditorial = z.infer<typeof episodeEditorialSchema>;

export type EpisodeThumbnail = z.infer<typeof episodeThumbnailSchema>;

/** A local copy of the video's YouTube thumbnail, or the branded 16:9 fallback (spec §3.5). */
export type EpisodeArtwork =
  ({ kind: "youtube" } & Omit<EpisodeThumbnail, "youtubeId">) | { kind: "fallback" };

/** What pages render: feed data, reviewed editorial content and resolved artwork (spec §6.5). */
export type EpisodeView = Episode &
  Omit<EpisodeEditorial, "slug"> & {
    hasVideo: boolean;
    mediaKind: "audio-only" | "audio-video";
    artwork: EpisodeArtwork;
    showNotes: ShowNotes;
  };

export type FeedIssue = {
  severity: "error" | "warning";
  itemIndex?: number;
  sourceGuid?: string;
  field: string;
  message: string;
};
