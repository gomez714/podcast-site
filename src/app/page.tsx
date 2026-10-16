import Image from "next/image";

import { Section, SectionHeading } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/button-link";

import coverArt from "../../public/images/brand/cover-art.jpg";

export default function HomePage() {
  return (
    <>
      <Section tone="dark" aria-labelledby="home-headline" className="pt-[clamp(3rem,6vw,4.5rem)]">
        <div className="max-w-[590px]">
          <p className="flex items-center gap-3.5 eyebrow text-ice">
            <span aria-hidden="true" className="h-0.5 w-7 bg-sky" />
            Beyond what you see
          </p>
          <h1 id="home-headline" className="my-7 display-xl">
            There&apos;s more <span className="block text-ice">to every story.</span>
          </h1>
          <p className="mb-8 max-w-[490px] text-[clamp(0.875rem,1.15vw,1.0625rem)] leading-[1.9] text-[#d9f5ff]">
            Everyone has experiences, perspectives, and parts of themselves that don&apos;t always
            make it into everyday conversation. Here, we make room for them.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/#about">
              Discover the podcast <span aria-hidden="true">↗</span>
            </ButtonLink>
            <ButtonLink href="/episodes" variant="outline-on-dark">
              Explore episodes <span aria-hidden="true">→</span>
            </ButtonLink>
          </div>
          <p className="mt-10 flex items-center gap-2.5 text-[11px] tracking-[0.04em] text-ice uppercase">
            <span
              aria-hidden="true"
              className="size-[7px] rounded-full bg-bright shadow-[0_0_0_4px_rgb(93_198_255/0.1)]"
            />
            A new chapter is coming
          </p>
        </div>
      </Section>

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
          <div className="max-w-[65ch] space-y-4 text-[15px] leading-[2] text-[#334d77]">
            <p>
              The Bottom Left Pane is built around the stories, perspectives, and experiences we
              keep to ourselves. Every conversation is a chance to listen a little closer, get
              curious, and discover something we might otherwise never see.
            </p>
            <p>
              Not every story needs a dramatic reveal. Sometimes, the most interesting thing is
              simply making room for a real conversation.
            </p>
          </div>
        </div>
        <Image
          src={coverArt}
          alt="The Bottom Left Pane cover art: a figure at an open, glowing door inside a four-pane window onto blue mountains."
          sizes="(min-width: 1024px) 350px, (min-width: 768px) 270px, 290px"
          placeholder="blur"
          className="aspect-square w-full max-w-[290px] rounded-lg shadow-[18px_18px_0_var(--brand-ice)] md:max-w-none"
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
          Visit the archive <span aria-hidden="true">↗</span>
        </ButtonLink>
      </Section>
    </>
  );
}
