import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  TranscriptNote,
  TranscriptTurns,
  transcriptLength,
} from "@/components/episodes/EpisodeTranscript";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/button-link";
import { getAllEpisodes, getEpisodeBySlug } from "@/lib/episodes/repository";
import { getEpisodeTranscript } from "@/lib/episodes/transcripts";
import { formatDuration, formatEpisodeDate } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

export function generateStaticParams() {
  return getAllEpisodes()
    .filter((episode) => getEpisodeTranscript(episode.slug))
    .map((episode) => ({ slug: episode.slug }));
}

function load(slug: string) {
  const episode = getEpisodeBySlug(slug);
  const turns = episode && getEpisodeTranscript(slug);
  if (!episode || !turns) notFound();
  return { episode, turns };
}

export async function generateMetadata({
  params,
}: PageProps<"/episodes/[slug]/transcript">): Promise<Metadata> {
  const { episode } = load((await params).slug);
  return pageMetadata({
    title: `Transcript: ${episode.title}`,
    description: `The full conversation with ${episode.guestName}, as an automatic transcript of the episode.`,
    path: `/episodes/${episode.slug}/transcript`,
    type: "article",
    publishedTime: episode.publishedAt,
  });
}

/**
 * An episode's full transcript on its own page (host's choice, Oct 29, 2026): transcripts run to
 * 11,000+ words, which made the episode page tens of thousands of pixels tall. The episode page's
 * Transcript tab previews the opening and links here. Like the episode page, `params` is awaited
 * outside any Suspense boundary so every transcript prerenders fully; unknown slugs get a real
 * 404 from `src/proxy.ts`.
 */
export default async function TranscriptPage({ params }: PageProps<"/episodes/[slug]/transcript">) {
  const { episode, turns } = load((await params).slug);
  const episodePath = `/episodes/${episode.slug}`;
  // Per-episode ids: a page you navigated away from stays in the DOM, hidden.
  const titleId = `transcript-title-${episode.slug}`;
  const episodeLabel = episode.episodeNumber
    ? `Episode ${episode.episodeNumber}`
    : episode.guestName;

  return (
    <>
      <Section tone="dark" aria-labelledby={titleId} className="pt-6 sm:pt-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm font-semibold text-ice">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/episodes"
                className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
              >
                Episodes
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={episodePath}
                className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
              >
                {episodeLabel}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-pale">
              Transcript
            </li>
          </ol>
        </nav>

        <p className="eyebrow text-ice">Transcript</p>
        <h1
          id={titleId}
          className="mt-4 max-w-4xl font-display text-[clamp(1.75rem,3.6vw,3rem)] leading-[1.05] font-extrabold text-balance"
        >
          {episode.title}
        </h1>
        <ul className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-pale">
          <li>with {episode.guestName}</li>
          <li aria-hidden="true">·</li>
          <li>
            <time dateTime={episode.publishedAt}>{formatEpisodeDate(episode.publishedAt)}</time>
          </li>
          {episode.durationSeconds && (
            <>
              <li aria-hidden="true">·</li>
              <li>{formatDuration(episode.durationSeconds)}</li>
            </>
          )}
          <li aria-hidden="true">·</li>
          <li>{transcriptLength(turns)}</li>
        </ul>
        {episode.contentNote && (
          <p className="mt-4 max-w-[62ch] border-l-2 border-ice pl-3 text-sm text-pale">
            <span className="font-bold text-white">Content note:</span> {episode.contentNote}
          </p>
        )}
        <ButtonLink href={episodePath} className="mt-8">
          Listen to the episode <span aria-hidden="true">→</span>
        </ButtonLink>
      </Section>

      <Section tone="paper" aria-label="Transcript">
        <div className="max-w-[72ch]">
          <TranscriptNote />
          <TranscriptTurns turns={turns} />
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line-light pt-8">
            <ButtonLink href={episodePath} variant="solid">
              Listen to the episode <span aria-hidden="true">→</span>
            </ButtonLink>
            <Link
              href="/episodes"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-navy underline decoration-ice decoration-2 underline-offset-[6px] hover:decoration-navy"
            >
              All episodes <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
