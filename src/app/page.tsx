import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { FeaturedEpisodes } from "@/components/home/FeaturedEpisodes";
import { HomeHero } from "@/components/home/HomeHero";
import { HostTeaser } from "@/components/home/HostTeaser";
import { Section, SectionHeading } from "@/components/layout/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/button-link";
import { showPremise } from "@/content/show";
import { pageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";
import { podcastSeriesJsonLd } from "@/lib/structured-data";

import coverArt from "../../public/images/brand/cover-art.jpg";

export const metadata: Metadata = pageMetadata({
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  absoluteTitle: true,
  description: siteConfig.description,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={podcastSeriesJsonLd()} />
      <HomeHero />

      <Section
        tone="light"
        id="about"
        aria-labelledby="about-heading"
        containerClassName="grid items-center gap-[clamp(2rem,8vw,7.5rem)] md:grid-cols-[1fr_270px] lg:grid-cols-[1fr_350px]"
      >
        <div>
          <SectionHeading id="about-heading" eyebrow="01 / About the podcast">
            What&apos;s behind <br />
            the pane?
          </SectionHeading>
          <div className="max-w-[65ch] space-y-4 text-base leading-[1.8] text-[#334d77] md:text-[15px] md:leading-[2]">
            <p>{showPremise.intro}</p>
            <p>{showPremise.name}</p>
            <p>{showPremise.closing}</p>
          </div>
          <Link
            href="/about"
            className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-navy underline decoration-slate decoration-2 underline-offset-[6px] hover:decoration-navy"
          >
            More about the show <span aria-hidden="true">→</span>
          </Link>
        </div>
        <Image
          src={coverArt}
          alt="The Bottom Left Pane cover art: a figure at an open, glowing door inside a four-pane window onto blue mountains."
          sizes="(min-width: 1024px) 350px, (min-width: 768px) 270px, 290px"
          placeholder="blur"
          // Phones saw this same art in the hero a screen earlier.
          className="hidden aspect-square w-full rounded-lg shadow-[18px_18px_0_var(--brand-ice)] md:block"
        />
      </Section>

      <Section
        tone="dark"
        id="revival"
        aria-labelledby="revival-heading"
        containerClassName="grid items-center gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-16"
      >
        <div>
          <SectionHeading id="revival-heading" eyebrow="02 / A new chapter">
            The conversation <br />
            isn&apos;t over.
          </SectionHeading>
          <p className="max-w-[660px] text-sm leading-[1.85] text-pale">
            The Bottom Left Pane is getting ready to return. Until then, revisit the conversations
            that started it all.
          </p>
        </div>

        {/* Two ways in (host's choice, Oct 28, 2026): listeners catch up, future guests apply.
            The archive stays the section's one button. */}
        <ul className="w-full max-w-md divide-y divide-line-dark rounded-lg border border-line-dark bg-white/5 px-7 lg:max-w-none">
          <li className="grid justify-items-start gap-3 py-7">
            <p className="text-[0.6875rem] font-extrabold tracking-[0.2em] text-ice uppercase">
              Catch up
            </p>
            <p className="text-sm text-pale">Listen to every episode so far.</p>
            <ButtonLink href="/episodes">
              Visit the archive <span aria-hidden="true">→</span>
            </ButtonLink>
          </li>
          <li className="grid justify-items-start gap-3 py-7">
            <p className="text-[0.6875rem] font-extrabold tracking-[0.2em] text-ice uppercase">
              Join in
            </p>
            <p className="text-sm text-pale">Have a story worth sharing?</p>
            <Link
              href="/be-a-guest"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-white underline decoration-ice decoration-2 underline-offset-[6px] hover:decoration-white"
            >
              Find out how to be a guest <span aria-hidden="true">→</span>
            </Link>
          </li>
        </ul>
      </Section>

      <FeaturedEpisodes />

      <HostTeaser />
    </>
  );
}
