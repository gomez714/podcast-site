import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EpisodeEditorial } from "@/components/episodes/EpisodeEditorial";
import { EpisodeMedia, EpisodeMediaProvider } from "@/components/episodes/EpisodeMedia";
import { EpisodeSplitHero } from "@/components/episodes/EpisodeSplitHero";
import { RelatedEpisodes } from "@/components/episodes/RelatedEpisodes";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAllEpisodes, getEpisodeBySlug, getRelatedEpisodes } from "@/lib/episodes/repository";
import { pageMetadata } from "@/lib/metadata";
import { podcastEpisodeJsonLd } from "@/lib/structured-data";

import fallbackArt from "../../../../public/images/brand/episode-fallback.jpg";

export function generateStaticParams() {
  return getAllEpisodes().map((episode) => ({ slug: episode.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/episodes/[slug]">): Promise<Metadata> {
  const episode = getEpisodeBySlug((await params).slug);
  if (!episode) notFound();
  const image = episode.artwork.kind === "youtube" ? episode.artwork : fallbackArt;
  return pageMetadata({
    title: episode.title,
    description: episode.summary,
    path: `/episodes/${episode.slug}`,
    type: "article",
    publishedTime: episode.publishedAt,
    images: [{ url: image.src, width: image.width, height: image.height }],
  });
}

/**
 * Episode page (spec §5.3). `params` is awaited outside any Suspense boundary: every slug is listed
 * in `generateStaticParams`, so each page prerenders completely. A boundary here made the HTML
 * ship a loading skeleton ahead of the content, which slow connections painted first and then
 * swapped out (a layout shift). Unknown slugs get a real 404 from `src/proxy.ts` before rendering.
 */
export default async function EpisodePage({ params }: PageProps<"/episodes/[slug]">) {
  const episode = getEpisodeBySlug((await params).slug);
  if (!episode) notFound();

  const image = episode.artwork.kind === "youtube" ? episode.artwork : fallbackArt;

  return (
    <EpisodeMediaProvider key={episode.slug} title={episode.title}>
      <JsonLd data={podcastEpisodeJsonLd(episode, image.src)} />
      <EpisodeSplitHero
        episode={episode}
        media={
          <EpisodeMedia
            title={episode.title}
            guestName={episode.guestName}
            audioUrl={episode.audioUrl}
            durationSeconds={episode.durationSeconds}
            youtubeId={episode.youtubeId}
            artwork={episode.artwork}
          />
        }
      />
      <EpisodeEditorial episode={episode} />
      <RelatedEpisodes
        episodes={getRelatedEpisodes(episode)}
        headingId={`more-conversations-${episode.slug}`}
      />
    </EpisodeMediaProvider>
  );
}
