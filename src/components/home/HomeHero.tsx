import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/button-link";

import { HeroArtwork } from "./HeroArtwork";

/** Phones: half-width buttons, so tighter padding and gap than the `cta` size. */
const heroButtonClass = "justify-center gap-2.5 px-3 md:justify-start md:gap-4 md:px-5.5";

/**
 * Approved V5 hero: copy on the left, the opening-door artwork on the right. Below desktop width
 * the artwork stacks above the copy so the door opening is seen first (approved change, spec §4.1).
 * The copy stays first in the DOM; the artwork is decorative, so only its visual position moves.
 */
export function HomeHero() {
  return (
    <section
      aria-labelledby="home-headline"
      className="relative isolate overflow-hidden surface-dark bg-[radial-gradient(circle_at_50%_22%,rgb(69_151_205/0.19),transparent_42%)] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:z-[3] after:h-[125px] after:bg-linear-to-t after:from-navy/90 after:to-transparent lg:bg-[radial-gradient(circle_at_72%_45%,rgb(69_151_205/0.19),transparent_42%)]"
    >
      <Container className="grid items-center gap-5 pt-5 pb-12 md:gap-8 md:pt-10 md:pb-20 lg:min-h-[min(810px,calc(100svh-88px))] lg:grid-cols-[44%_56%] lg:gap-2 lg:pt-[58px] lg:pb-[120px]">
        {/* Above the bottom fade (z-3), which would otherwise dim the last line on phones. */}
        <div className="relative z-[4] max-w-[590px] md:mx-auto md:w-full lg:mx-0">
          <p className="flex items-center gap-3.5 eyebrow text-ice">
            <span aria-hidden="true" className="h-0.5 w-7 bg-sky" />
            Beyond what you see
          </p>
          <h1
            id="home-headline"
            className="my-[17px] font-display text-[clamp(3rem,12.4vw,3.625rem)] leading-[0.91] font-extrabold tracking-[-0.012em] uppercase min-[391px]:text-[clamp(3.1875rem,12.2vw,4.875rem)] md:my-7 md:text-[clamp(3.625rem,7.4vw,4.875rem)] lg:text-[clamp(3.75rem,6.6vw,6.875rem)]"
          >
            There&apos;s more <span className="block text-ice">to every story.</span>
          </h1>
          <p className="mb-[22px] max-w-[490px] text-[0.9375rem] leading-[1.75] text-[#d9f5ff] md:mb-8 md:text-[clamp(0.875rem,1.15vw,1.0625rem)] md:leading-[1.9]">
            Everyone has experiences, perspectives, and parts of themselves that don&apos;t always
            make it into everyday conversation. Here, we make room for them.
          </p>
          {/* Episodes lead (host's choice, Oct 28, 2026). On phones the two buttons share one row
              so both fit on the first screen, which needs the shorter "About the show" label;
              below 340px they stack. From md up they're auto width with the full labels. */}
          <div className="grid grid-cols-1 gap-2.5 min-[340px]:grid-cols-2 md:flex md:flex-wrap md:gap-3">
            <ButtonLink href="/episodes" className={heroButtonClass}>
              Explore episodes <span aria-hidden="true">→</span>
            </ButtonLink>
            <ButtonLink href="/#about" variant="outline-on-dark" className={heroButtonClass}>
              <span className="md:hidden">About the show</span>
              <span className="hidden md:inline">Discover the podcast</span>
              <span aria-hidden="true">↓</span>
            </ButtonLink>
          </div>
          {/* Jumps to the revival section. The faint underline is the link cue instead of ↓: a
              deliberate exception to the arrow convention (host's choice, Oct 28, 2026). */}
          <Link
            href="/#revival"
            className="group mt-3 inline-flex min-h-12 items-center gap-3 text-[15px] font-extrabold tracking-[0.05em] text-white uppercase md:mt-8"
          >
            <span aria-hidden="true" className="recording-light" />
            <span className="underline decoration-pale/60 decoration-2 underline-offset-[5px] transition-colors group-hover:decoration-rec">
              A new chapter is coming
            </span>
          </Link>
        </div>

        {/* On phones the artwork is about a quarter of the visible height, leaving room for the
            buttons and the chapter line on the first screen. */}
        <HeroArtwork className="relative z-[2] order-first mx-auto w-[min(80%,27svh)] md:w-[min(460px,44svh)] lg:order-none lg:w-[min(100%,715px)]" />
      </Container>

      <div aria-hidden="true" className="absolute inset-x-0 bottom-[35px] z-[4] hidden lg:block">
        <Container>
          <p className="flex items-center gap-3 text-[10px] tracking-[0.2em] text-ice uppercase before:h-[33px] before:w-px before:bg-ice">
            Scroll to explore
          </p>
        </Container>
      </div>
    </section>
  );
}
