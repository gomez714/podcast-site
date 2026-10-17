import { episodeEditorial, featuredEpisodeSlugs } from "@/content/episodes";
import thumbnails from "@/data/episode-thumbnails.json";
import snapshot from "@/data/episodes.snapshot.json";

import { EpisodeInventoryError } from "./inventory";
import {
  episodeEditorialSchema,
  episodeSnapshotSchema,
  episodeThumbnailManifestSchema,
} from "./schema";
import { parseShowNotes } from "./show-notes";
import type { Episode, EpisodeEditorial, EpisodeThumbnail, EpisodeView } from "./types";

/**
 * Joins feed episodes, editorial entries and thumbnails into the views pages render. Throws on any
 * mismatch so a missing entry, typo'd slug or stale thumbnail fails the build instead of shipping.
 */
export function buildEpisodeViews(
  episodes: Episode[],
  editorial: EpisodeEditorial[],
  thumbnailsBySlug: Readonly<Record<string, EpisodeThumbnail>>,
): EpisodeView[] {
  const problems: string[] = [];
  const editorialBySlug = new Map<string, EpisodeEditorial>();

  for (const entry of editorial) {
    const result = episodeEditorialSchema.safeParse(entry);
    if (!result.success)
      problems.push(`Editorial "${entry.slug}" is invalid: ${result.error.message}`);
    if (editorialBySlug.has(entry.slug)) problems.push(`Editorial "${entry.slug}" appears twice.`);
    if (!episodes.some((episode) => episode.slug === entry.slug)) {
      problems.push(`Editorial "${entry.slug}" has no matching episode in the snapshot.`);
    }
    for (const related of entry.relatedSlugs ?? []) {
      if (related === entry.slug) problems.push(`"${entry.slug}" lists itself as related.`);
      else if (!episodes.some((episode) => episode.slug === related)) {
        problems.push(`"${entry.slug}" lists unknown related episode "${related}".`);
      }
    }
    editorialBySlug.set(entry.slug, entry);
  }

  const views = episodes.flatMap((episode): EpisodeView[] => {
    const entry = editorialBySlug.get(episode.slug);
    if (!entry) {
      problems.push(`Episode "${episode.slug}" has no editorial entry in src/content/episodes.ts.`);
      return [];
    }

    const thumbnail = thumbnailsBySlug[episode.slug];
    if (entry.youtubeId && thumbnail?.youtubeId !== entry.youtubeId) {
      problems.push(
        `Thumbnail for "${episode.slug}" is missing or stale; run \`npm run assets:thumbnails\`.`,
      );
    }
    if (!entry.youtubeId && thumbnail) {
      problems.push(
        `"${episode.slug}" has a thumbnail but no youtubeId; run \`npm run assets:thumbnails\`.`,
      );
    }

    const hasVideo = Boolean(entry.youtubeId);
    return [
      {
        ...episode,
        ...entry,
        hasVideo,
        mediaKind: hasVideo ? "audio-video" : "audio-only",
        artwork:
          hasVideo && thumbnail
            ? {
                kind: "youtube",
                src: thumbnail.src,
                width: thumbnail.width,
                height: thumbnail.height,
                blurDataURL: thumbnail.blurDataURL,
              }
            : { kind: "fallback" },
        showNotes: parseShowNotes(episode.descriptionText, episode.durationSeconds),
      },
    ];
  });

  if (problems.length > 0) throw new EpisodeInventoryError(problems);
  return views;
}

/** Picks episodes by slug in the given order. Throws on an unknown slug so builds fail. */
export function selectBySlugs(views: EpisodeView[], slugs: readonly string[]): EpisodeView[] {
  return slugs.map((slug) => {
    const view = views.find((candidate) => candidate.slug === slug);
    if (!view) throw new Error(`Episode "${slug}" is not in the episode snapshot`);
    return view;
  });
}

let cache: EpisodeView[] | undefined;

/** Every published episode, newest first. */
export function getAllEpisodes(): EpisodeView[] {
  cache ??= buildEpisodeViews(
    episodeSnapshotSchema.parse(snapshot).episodes,
    episodeEditorial,
    episodeThumbnailManifestSchema.parse(thumbnails),
  );
  return cache;
}

export function getEpisodeBySlug(slug: string): EpisodeView | undefined {
  return getAllEpisodes().find((episode) => episode.slug === slug);
}

export function getFeaturedEpisodes(): EpisodeView[] {
  return selectBySlugs(getAllEpisodes(), featuredEpisodeSlugs);
}

/** Curated related episodes first, then the newest others, never the episode itself (spec §5.3). */
export function selectRelated(
  views: EpisodeView[],
  episode: EpisodeView,
  count = 3,
): EpisodeView[] {
  const curated = selectBySlugs(views, episode.relatedSlugs ?? []);
  const rest = views.filter(
    (view) => view.slug !== episode.slug && !curated.some((pick) => pick.slug === view.slug),
  );
  return [...curated, ...rest].slice(0, count);
}

export function getRelatedEpisodes(episode: EpisodeView): EpisodeView[] {
  return selectRelated(getAllEpisodes(), episode);
}
