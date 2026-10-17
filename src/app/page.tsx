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
        containerClassName="grid items-center gap-7 md:grid-cols-[1fr_auto]"
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
        <ButtonLink href="/episodes" className="justify-self-start">
          Visit the archive <span aria-hidden="true">→</span>
        </ButtonLink>
      </Section>

      <FeaturedEpisodes />

      <HostTeaser />
    </>
  );
}
