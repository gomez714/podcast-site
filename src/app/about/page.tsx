import { cn } from "cn";
import type { Metadata } from "next";

import { FeaturedEpisodes } from "@/components/home/FeaturedEpisodes";
import { HostTeaser } from "@/components/home/HostTeaser";
import { Section, SectionHeading } from "@/components/layout/Section";
import { johariPanes, showPremise } from "@/content/show";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "What The Bottom Left Pane is about, where its name comes from, who hosts it, and where to start listening.",
  path: "/about",
});

/**
 * About page (spec §5.4): the premise, the Johari window behind the name, the host (placeholder
 * until the host supplies an introduction) and a few starting episodes. No invented biography.
 */
export default function AboutPage() {
  return (
    <>
      <Section tone="dark" aria-labelledby="about-title">
        <p className="eyebrow text-ice">About the show</p>
        <h1 id="about-title" className="mt-4 max-w-4xl display-xl text-balance">
          What&apos;s behind <span className="block text-ice">the pane?</span>
        </h1>
        <p className="mt-6 max-w-[60ch] text-lg text-pale">{showPremise.intro}</p>
      </Section>

      <Section
        tone="light"
        aria-labelledby="johari-heading"
        containerClassName="grid items-center gap-[clamp(2.5rem,7vw,6.5rem)] md:grid-cols-[1fr_minmax(0,420px)]"
      >
        <div>
          <SectionHeading id="johari-heading" eyebrow="Where the name comes from">
            The Johari window.
          </SectionHeading>
          <div className="max-w-[62ch] space-y-4 text-base leading-[1.8] text-[#334d77] md:text-[15px] md:leading-[1.9]">
            <p>
              Psychologists Joseph Luft and Harrington Ingham created the Johari window in 1955. It
              sorts what can be known about a person into four panes, depending on whether you know
              it and whether other people do.
            </p>
            <p>{showPremise.name}</p>
            <p>{showPremise.closing}</p>
          </div>
        </div>

        <JohariWindow />
      </Section>

      <HostTeaser
        tone="paper"
        eyebrow="Your host"
        headingId="about-host-heading"
        sectionId="about-host"
      />

      <FeaturedEpisodes
        tone="light"
        eyebrow="Where to start"
        headingId="about-start-heading"
        sectionId="about-start"
      />
    </>
  );
}

/** The four panes as real text, laid out like the show's mark with the bottom-left pane lit. */
function JohariWindow() {
  return (
    <ul
      aria-label="The four panes of the Johari window"
      className="grid grid-cols-2 gap-2.5 rounded-lg bg-navy p-2.5 shadow-[18px_18px_0_var(--brand-ice)] sm:gap-3 sm:p-3"
    >
      {johariPanes.map((pane) => {
        const lit = "isShowPane" in pane;
        return (
          <li
            key={pane.name}
            className={cn(
              "flex aspect-square flex-col justify-end rounded-[4px] p-3.5 sm:p-5",
              lit
                ? "bg-pale text-navy shadow-[0_0_40px_rgb(93_198_255/0.55)]"
                : "bg-slate text-white",
            )}
          >
            {lit && (
              <span className="mb-auto text-[10px] font-extrabold tracking-[0.16em] uppercase sm:text-[11px]">
                The bottom left pane
              </span>
            )}
            <span className="font-display text-2xl leading-none font-extrabold uppercase sm:text-3xl">
              {pane.name}
            </span>
            <span className="mt-1.5 text-xs leading-snug font-semibold sm:text-sm">
              {pane.description}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
