import { cn } from "cn";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { FeaturedEpisodes } from "@/components/home/FeaturedEpisodes";
import { Section, SectionHeading } from "@/components/layout/Section";
import { hostIntro } from "@/content/host";
import { expectations, hiddenPane, johariPanes, showPremise } from "@/content/show";
import { pageMetadata } from "@/lib/metadata";

import hostPhoto from "../../../public/images/host/luis-reflection.jpg";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "What The Bottom Left Pane is about, where its name comes from, who hosts it, and where to start listening.",
  path: "/about",
});

const bodyCopy =
  "max-w-[62ch] space-y-4 text-base leading-[1.8] text-[#334d77] md:text-[15px] md:leading-[1.9]";

/**
 * About page (spec §5.4): the premise, the Johari window behind the name, what to expect, the
 * host's introduction and a few starting episodes. All copy is the host's own (`src/content/`).
 */
export default function AboutPage() {
  return (
    <>
      <Section tone="dark" aria-labelledby="about-title">
        <p className="eyebrow text-ice">About the show</p>
        <h1 id="about-title" className="mt-4 max-w-4xl display-xl text-balance">
          {showPremise.tagline[0]} <span className="block text-ice">{showPremise.tagline[1]}</span>
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
          <div className={bodyCopy}>
            <p>
              Psychologists Joseph Luft and Harrington Ingham created the Johari window in 1955. It
              sorts what can be known about a person into four panes, depending on whether you know
              it and whether other people do.
            </p>
            {hiddenPane.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <JohariWindow />
      </Section>

      <Section tone="paper" aria-labelledby="expect-heading">
        <SectionHeading id="expect-heading" eyebrow="What to expect">
          Where the conversation goes.
        </SectionHeading>
        <ul className="grid gap-x-10 gap-y-8 md:grid-cols-3">
          {expectations.points.map((point) => (
            <li key={point.title} className="border-t-2 border-ice pt-5">
              <h3 className="font-display text-xl leading-tight font-extrabold text-navy uppercase">
                {point.title}
              </h3>
              <p className="mt-3 text-base leading-[1.8] text-[#334d77] md:text-[15px]">
                {point.body}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-10 max-w-[62ch] text-lg leading-[1.7] font-semibold text-navy">
          {expectations.closing}
        </p>
      </Section>

      <Section
        tone="light"
        id="about-host"
        aria-labelledby="about-host-heading"
        containerClassName="grid items-start gap-[clamp(2.5rem,7vw,6.5rem)] md:grid-cols-[minmax(0,400px)_1fr]"
      >
        <Image
          src={hostPhoto}
          alt="Luis Gomez leaning against a dark glass wall, his reflection visible in the pane beside him."
          sizes="(min-width: 768px) 400px, calc(100vw - 2rem)"
          placeholder="blur"
          className="lg:top-12md:shadow-[18px_18px_0_var(--brand-ice)] aspect-4/3 w-full rounded-lg object-cover shadow-[10px_10px_0_var(--brand-ice)] md:sticky md:top-24"
        />

        <div>
          <SectionHeading id="about-host-heading" eyebrow="Your host">
            Hey, I&apos;m Luis Gomez.
          </SectionHeading>
          <div className={bodyCopy}>
            {hostIntro.about.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <h3 className="mt-10 mb-4 font-display text-2xl leading-tight font-extrabold text-navy uppercase">
            Why I started the show
          </h3>
          <div className={bodyCopy}>
            {hostIntro.why.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <p className="mt-10 font-display text-[clamp(1.5rem,3vw,2rem)] leading-tight font-extrabold text-balance text-navy uppercase">
            {hostIntro.signOff.emphasis}
          </p>
          <p className="mt-4 text-base leading-[1.8] text-[#334d77] md:text-[15px]">
            {hostIntro.signOff.welcome.join(" ")}
          </p>
          <Link
            href="/episodes/ep-1-luis-gomez"
            className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-navy underline decoration-slate decoration-2 underline-offset-[6px] hover:decoration-navy"
          >
            Hear my story in episode 1 <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Section>

      <FeaturedEpisodes
        tone="paper"
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
