import type { MetadataRoute } from "next";

import { getAllEpisodes } from "@/lib/episodes/repository";
import { absoluteUrl } from "@/lib/structured-data";

/** Every public page (spec §5). Episodes carry their publish date; static pages have no date to claim. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "/",
    "/episodes",
    "/about",
    "/be-a-guest",
    "/contact",
    "/privacy",
    "/guest-privacy",
  ].map((path) => ({
    url: absoluteUrl(path),
  }));
  const episodes = getAllEpisodes().map((episode) => ({
    url: absoluteUrl(`/episodes/${episode.slug}`),
    lastModified: episode.publishedAt,
  }));
  return [...pages, ...episodes];
}
