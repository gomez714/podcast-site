import { z } from "zod";

const httpsUrl = z.url({ protocol: /^https$/ });

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase words separated by single hyphens");

export const sourceEpisodeSchema = z.object({
  sourceGuid: z.string().min(1),
  episodeNumber: z.int().positive().optional(),
  title: z.string().min(1),
  publishedAt: z.iso.datetime(),
  durationSeconds: z.int().positive().optional(),
  explicit: z.boolean(),
  audioUrl: httpsUrl,
  audioMimeType: z.string().optional(),
  audioByteLength: z.int().positive().optional(),
  sourceArtworkUrl: httpsUrl.optional(),
  transcriptUrl: httpsUrl.optional(),
  descriptionText: z.string(),
  originalDescriptionHtml: z.string().optional(),
});

export const episodeSchema = sourceEpisodeSchema.extend({
  slug: slugSchema,
});

export const showSchema = z.object({
  title: z.string().min(1),
  link: httpsUrl.optional(),
  feedUrl: httpsUrl.optional(),
  language: z.string().optional(),
  author: z.string().optional(),
  artworkUrl: httpsUrl.optional(),
  explicit: z.boolean(),
  type: z.enum(["episodic", "serial"]).optional(),
});

export const episodeSnapshotSchema = z.object({
  sourceUrl: z.string(),
  show: showSchema,
  episodes: z.array(episodeSchema),
});

export const youtubeIdSchema = z.string().regex(/^[A-Za-z0-9_-]{11}$/, "Not a YouTube video ID");

/** Hand-written content joined to an RSS episode by slug. Never overwritten by a feed sync. */
export const episodeEditorialSchema = z.object({
  slug: slugSchema,
  guestName: z.string().min(1),
  /** Short card summary, written from the show notes. */
  summary: z.string().min(40).max(260),
  topics: z.array(z.string().min(1)).min(1).max(5),
  /** Host-approved heads-up for sensitive subjects, shown before someone starts listening. */
  contentNote: z.string().min(1).max(80).optional(),
  /** The filmed conversation on the show's channel, only once confirmed. */
  youtubeId: youtubeIdSchema.optional(),
  /** Guest links the host has checked are current. Show-note links are never published as-is. */
  guestLinks: z
    .array(z.object({ label: z.string().min(1), href: z.url({ protocol: /^https$/ }) }))
    .max(4)
    .optional(),
  /** Hand-picked "More conversations"; the newest other episodes fill any remaining spots. */
  relatedSlugs: z.array(slugSchema).max(3).optional(),
  reviewStatus: z.enum(["draft", "reviewed"]),
});

export const episodeThumbnailSchema = z.object({
  youtubeId: youtubeIdSchema,
  src: z.string().startsWith("/images/episodes/"),
  width: z.int().positive(),
  height: z.int().positive(),
  blurDataURL: z.string().startsWith("data:image/"),
});

export const episodeThumbnailManifestSchema = z.record(slugSchema, episodeThumbnailSchema);
