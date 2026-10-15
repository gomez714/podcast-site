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
