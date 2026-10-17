import Link from "next/link";
import type { ReactNode } from "react";

import { Section } from "@/components/layout/Section";
import type { EpisodeView } from "@/lib/episodes/types";
import { formatDuration, formatEpisodeDate } from "@/lib/format";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Approved split hero C (spec §5.3): details on the left, media on the right. Source order is
 * title → media → summary so phones reach the player without scrolling past the summary; from `lg`
 * the grid puts the summary back under the title. The content note stays above the player.
 */
export function EpisodeSplitHero({ episode, media }: { episode: EpisodeView; media: ReactNode }) {
  // Per-episode ids: a page you navigated away from stays in the DOM (hidden), so two episode
  // pages can be in the document at once.
  const titleId = `episode-title-${episode.slug}`;

  return (
    <Section
      tone="dark"
      aria-labelledby={titleId}
      className="pt-6 sm:pt-10 lg:pt-[clamp(4rem,8vw,6.5rem)]"
    >
      <nav aria-label="Breadcrumb" className="mb-2 text-sm font-semibold text-ice lg:mb-5">
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
          <li aria-current="page" className="text-pale">
            {episode.episodeNumber ? `Episode ${episode.episodeNumber}` : episode.guestName}
          </li>
        </ol>
      </nav>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:grid-rows-[auto_1fr] lg:gap-x-14 xl:grid-cols-[minmax(0,1fr)_minmax(0,560px)]">
        <div className="lg:col-start-1 lg:row-start-1 lg:pt-2">
          {episode.episodeNumber && (
            // The breadcrumb already names the episode on smaller screens.
            <p className="hidden eyebrow text-ice lg:block">Episode {pad(episode.episodeNumber)}</p>
          )}
          {/* The title's own casing: long titles read more easily than in all caps (spec §3.2). */}
          <h1
            id={titleId}
            className="font-display text-[clamp(1.85rem,4.4vw,3.6rem)] leading-[1.05] font-extrabold text-balance lg:mt-4"
          >
            {episode.title}
          </h1>

          <ul className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-pale lg:mt-6">
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
            {episode.explicit && (
              <li className="rounded-sm bg-pale px-2 py-0.5 text-xs font-extrabold tracking-[0.06em] text-navy uppercase">
                Explicit
              </li>
            )}
          </ul>

          {episode.contentNote && (
            <p className="mt-4 max-w-[62ch] border-l-2 border-ice pl-3 text-sm text-pale">
              <span className="font-bold text-white">Content note:</span> {episode.contentNote}
            </p>
          )}
        </div>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">{media}</div>

        <p className="max-w-[62ch] text-lg text-pale lg:col-start-1 lg:row-start-2">
          {episode.summary}
        </p>
      </div>
    </Section>
  );
}
