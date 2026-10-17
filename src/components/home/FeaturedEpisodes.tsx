import Link from "next/link";

import { EpisodeCard } from "@/components/episodes/EpisodeCard";
import { Section, SectionHeading } from "@/components/layout/Section";
import { getFeaturedEpisodes } from "@/lib/episodes/repository";

import { EpisodeCarousel } from "@/components/episodes/EpisodeCarousel";

const CARD_SIZES = "(min-width: 1024px) 400px, (min-width: 768px) 42vw, 80vw";

/**
 * Three curated conversations plus the path to the full archive (spec §5.1 items 4–5). A swipeable
 * row below desktop width, a three-column grid from `lg`.
 */
export function FeaturedEpisodes({
  eyebrow = "03 / Featured conversations",
  headingId = "episodes-heading",
  sectionId = "episodes",
  tone = "paper",
}: {
  eyebrow?: string;
  /** Unique per page: Next keeps visited pages in the DOM, so the About page passes its own ids. */
  headingId?: string;
  sectionId?: string;
  tone?: "light" | "paper";
}) {
  const episodes = getFeaturedEpisodes();

  return (
    <Section tone={tone} id={sectionId} aria-labelledby={headingId}>
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <div>
          <SectionHeading id={headingId} eyebrow={eyebrow} className="[&_h2]:mb-3">
            Stories worth hearing.
          </SectionHeading>
          <p className="max-w-[620px] text-sm leading-[1.75] text-slate">
            Start with three of the most-listened-to conversations from the archive.
          </p>
        </div>
        <Link
          href="/episodes"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-navy underline decoration-ice decoration-2 underline-offset-[6px] hover:decoration-navy"
        >
          See all episodes <span aria-hidden="true">→</span>
        </Link>
      </div>

      <EpisodeCarousel label="Featured episodes">
        {episodes.map((episode) => (
          <li key={episode.slug} className="flex">
            <EpisodeCard episode={episode} sizes={CARD_SIZES} />
          </li>
        ))}
      </EpisodeCarousel>
    </Section>
  );
}
