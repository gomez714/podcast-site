import { Section } from "@/components/layout/Section";
import { ExternalLink } from "@/components/ui/external-link";
import { ANALYTICS_EVENTS, trackClicks } from "@/lib/analytics";
import { getEpisodeTranscript } from "@/lib/episodes/transcripts";
import type { EpisodeView } from "@/lib/episodes/types";
import { platformLinks } from "@/lib/site";

import { EpisodeChapters } from "./EpisodeChapters";
import { type EpisodeDetailTab, EpisodeDetailTabs } from "./EpisodeDetailTabs";
import { EpisodeTranscriptPreview } from "./EpisodeTranscript";
import { ShowMoreList } from "./ShowMoreList";

const showListenLinks = platformLinks.filter(
  (link) => link.label === "Apple Podcasts" || link.label === "Spotify",
);

const externalLinkClass =
  "inline-flex min-h-11 items-center gap-1.5 font-bold text-navy underline underline-offset-4 hover:text-slate";

/**
 * About / Chapters / Transcript tabs and links (spec §5.3 items 5–7). Everything here comes from
 * the published show notes, the synced Fusebox transcript or host-checked editorial data; topics
 * appear only once reviewed.
 */
export function EpisodeEditorial({ episode }: { episode: EpisodeView }) {
  const { paragraphs, takeaways, chapters } = episode.showNotes;
  const youtube = episode.youtubeId
    ? { label: "YouTube", href: `https://www.youtube.com/watch?v=${episode.youtubeId}` }
    : platformLinks.find((link) => link.label === "YouTube");
  const listenLinks = youtube ? [...showListenLinks, youtube] : showListenLinks;

  const about = (
    <div className="max-w-[68ch]">
      <div className="space-y-4 text-slate">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {takeaways.length > 0 && (
        <>
          <h3 className="mt-10 text-lg font-bold text-navy">Takeaways</h3>
          <ShowMoreList
            visible={5}
            noun="takeaways"
            className="mt-4 list-disc space-y-2 pl-5 text-slate marker:text-mid"
            items={takeaways.map((takeaway) => ({ key: takeaway, content: takeaway }))}
          />
        </>
      )}

      {episode.reviewStatus === "reviewed" && (
        <>
          <h3 className="sr-only">Topics</h3>
          <ul className="mt-10 flex flex-wrap gap-2">
            {episode.topics.map((topic) => (
              <li
                key={topic}
                className="rounded-full bg-pale px-3 py-1 text-xs font-bold text-navy"
              >
                {topic}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );

  const transcript = getEpisodeTranscript(episode.slug);
  const tabs: EpisodeDetailTab[] = [{ value: "about", label: "About", content: about }];
  if (chapters.length > 0) {
    tabs.push({
      value: "chapters",
      label: (
        <>
          {/* Full colour, not faded: the count must meet 4.5:1 contrast like the label. */}
          Chapters <span className="font-semibold">({chapters.length})</span>
        </>
      ),
      content: (
        <div className="max-w-3xl">
          <p className="mb-4 text-sm text-slate">
            Times follow the audio. Pick one to start listening from there.
          </p>
          <EpisodeChapters chapters={chapters} />
        </div>
      ),
    });
  }
  if (transcript) {
    tabs.push({
      value: "transcript",
      label: "Transcript",
      content: <EpisodeTranscriptPreview slug={episode.slug} turns={transcript} />,
    });
  }

  return (
    <Section tone="paper" aria-labelledby={`about-episode-${episode.slug}`}>
      <h2
        id={`about-episode-${episode.slug}`}
        className="mb-6 font-display text-[clamp(1.9rem,3.4vw,2.75rem)] leading-none font-extrabold text-navy uppercase"
      >
        The conversation
      </h2>

      {tabs.length > 1 ? <EpisodeDetailTabs tabs={tabs} /> : about}

      <div className="mt-12 flex flex-wrap gap-x-16 gap-y-8 border-t border-line-light pt-8">
        <div>
          <h3 className="text-lg font-bold text-navy">Listen elsewhere</h3>
          <ul className="mt-1 flex flex-wrap gap-x-5 text-sm">
            {listenLinks.map((link) => (
              <li key={link.label}>
                <ExternalLink
                  href={link.href}
                  className={externalLinkClass}
                  {...trackClicks(ANALYTICS_EVENTS.platformClick, {
                    platform: link.label,
                    placement: "Episode page",
                  })}
                >
                  {link.label}
                </ExternalLink>
              </li>
            ))}
          </ul>
        </div>

        {episode.guestLinks && episode.guestLinks.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-navy">Find {episode.guestName}</h3>
            <ul className="mt-1 flex flex-wrap gap-x-5 text-sm">
              {episode.guestLinks.map((link) => (
                <li key={link.href}>
                  <ExternalLink href={link.href} className={externalLinkClass}>
                    {link.label}
                  </ExternalLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Section>
  );
}
