import type { Metadata } from "next";

import { EpisodeGrid } from "@/components/episodes/EpisodeGrid";
import { Section } from "@/components/layout/Section";
import { ExternalLink } from "@/components/ui/external-link";
import { getAllEpisodes } from "@/lib/episodes/repository";
import { pageMetadata } from "@/lib/metadata";
import { ANALYTICS_EVENTS, trackClicks } from "@/lib/analytics";
import { platformLinks } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Episodes",
  description:
    "Every conversation from The Bottom Left Pane, newest first. Listen on the site, or watch the episodes that were filmed.",
  path: "/episodes",
});

/** Archive (spec §5.2): every published episode, newest first by publish date. */
export default function EpisodesPage() {
  const episodes = getAllEpisodes();

  return (
    <>
      <Section tone="dark" aria-labelledby="episodes-title">
        <p className="eyebrow text-ice">The archive</p>
        <h1 id="episodes-title" className="mt-4 display-xl text-balance">
          Every conversation.
        </h1>
        <p className="mt-6 max-w-[60ch] text-lg text-pale">
          {episodes.length > 0
            ? `All ${episodes.length} episodes so far, newest first. Listen right here, or watch the ones that were filmed.`
            : "Episodes will be listed here."}
        </p>
      </Section>

      <Section tone="paper" aria-labelledby="all-episodes">
        {/* Keeps the outline H1 → H2 → H3 (card titles) for screen-reader heading navigation. */}
        <h2 id="all-episodes" className="sr-only">
          All episodes
        </h2>
        {episodes.length > 0 ? (
          <EpisodeGrid episodes={episodes} />
        ) : (
          <div className="max-w-[60ch] text-slate">
            <p className="font-bold text-navy">
              The episode list couldn&apos;t be shown right now.
            </p>
            <p className="mt-2">
              Every episode is still available in your podcast app:{" "}
              {platformLinks
                .filter((link) => link.label !== "Instagram")
                .map((link, i) => (
                  <span key={link.href}>
                    {i > 0 && ", "}
                    <ExternalLink
                      href={link.href}
                      className="font-bold text-navy underline underline-offset-4"
                      {...trackClicks(ANALYTICS_EVENTS.platformClick, {
                        platform: link.label,
                        placement: "Episodes page",
                      })}
                    >
                      {link.label}
                    </ExternalLink>
                  </span>
                ))}
              .
            </p>
          </div>
        )}
      </Section>
    </>
  );
}
