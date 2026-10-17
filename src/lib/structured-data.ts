import type { EpisodeView } from "./episodes/types";
import { platformLinks, siteConfig } from "./site";

/** Square cover art in `public/`, used as the series image (spec §3.5). */
const COVER_ART_PATH = "/images/brand/cover-art.jpg";

export const absoluteUrl = (path: string) => new URL(path, siteConfig.url).toString();

/** ISO 8601 duration, e.g. 1338 → "PT22M18S". */
export function isoDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${s || seconds === 0 ? `${s}S` : ""}`;
}

const seriesReference = () => ({
  "@type": "PodcastSeries",
  name: siteConfig.name,
  url: absoluteUrl("/"),
});

/** schema.org `PodcastSeries` for the show (spec §11, Phase 6). Only verified facts. */
export function podcastSeriesJsonLd() {
  return {
    "@context": "https://schema.org",
    ...seriesReference(),
    description: siteConfig.description,
    image: absoluteUrl(COVER_ART_PATH),
    webFeed: siteConfig.rssUrl,
    inLanguage: "en",
    author: { "@type": "Person", name: siteConfig.host },
    sameAs: platformLinks.map((link) => link.href),
  };
}

/**
 * schema.org `PodcastEpisode`. The audio is the episode's own Fusebox enclosure. Video is left out
 * on purpose: Google's `VideoObject` needs an upload date we haven't verified.
 */
export function podcastEpisodeJsonLd(episode: EpisodeView, imagePath: string) {
  return {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    name: episode.title,
    url: absoluteUrl(`/episodes/${episode.slug}`),
    description: episode.summary,
    datePublished: episode.publishedAt,
    ...(episode.episodeNumber && { episodeNumber: episode.episodeNumber }),
    ...(episode.durationSeconds && { timeRequired: isoDuration(episode.durationSeconds) }),
    image: absoluteUrl(imagePath),
    associatedMedia: {
      "@type": "MediaObject",
      contentUrl: episode.audioUrl,
      encodingFormat: episode.audioMimeType ?? "audio/mpeg",
    },
    partOfSeries: seriesReference(),
  };
}
