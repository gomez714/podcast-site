import Link from "next/link";

import { Section, SectionHeading } from "@/components/layout/Section";
import type { EpisodeView } from "@/lib/episodes/types";

import { EpisodeCard } from "./EpisodeCard";
import { EpisodeCarousel } from "./EpisodeCarousel";

const CARD_SIZES = "(min-width: 1024px) 400px, (min-width: 768px) 42vw, 80vw";

/**
 * Curated picks, topped up with the newest other episodes (spec §5.3 item 8). A swipeable row
 * below desktop width, like the homepage's featured episodes.
 */
export function RelatedEpisodes({
  episodes,
  headingId,
}: {
  episodes: EpisodeView[];
  /** Unique per page: hidden pages stay in the DOM, so a shared id could label the wrong section. */
  headingId: string;
}) {
  if (episodes.length === 0) return null;
  return (
    <Section tone="light" aria-labelledby={headingId}>
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <SectionHeading id={headingId} eyebrow="Keep listening" className="[&_h2]:mb-0">
          More conversations.
        </SectionHeading>
        <Link
          href="/episodes"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-navy underline decoration-ice decoration-2 underline-offset-[6px] hover:decoration-navy"
        >
          See all episodes <span aria-hidden="true">→</span>
        </Link>
      </div>
      <EpisodeCarousel label="More conversations">
        {episodes.map((episode) => (
          <li key={episode.slug} className="flex">
            <EpisodeCard episode={episode} sizes={CARD_SIZES} />
          </li>
        ))}
      </EpisodeCarousel>
    </Section>
  );
}
