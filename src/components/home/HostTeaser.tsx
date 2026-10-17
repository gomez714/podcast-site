import Image from "next/image";
import Link from "next/link";

import { Section, SectionHeading } from "@/components/layout/Section";
import { hostIntro } from "@/content/host";

import hostPhoto from "../../../public/images/host/luis-candid.jpg";

/** About the host on the homepage (spec §5.1 item 6): a short introduction, secondary to the guests. */
export function HostTeaser() {
  return (
    <Section
      tone="light"
      id="host"
      aria-labelledby="host-heading"
      containerClassName="grid items-center gap-[clamp(2.5rem,7vw,6.5rem)] md:grid-cols-[minmax(0,360px)_1fr]"
    >
      <Image
        src={hostPhoto}
        alt="Luis Gomez sitting on a brick ledge outside a building, turned toward the camera mid-laugh."
        sizes="(min-width: 768px) 360px, calc(100vw - 2rem)"
        placeholder="blur"
        className="aspect-5/4 w-full rounded-lg object-cover shadow-[10px_10px_0_var(--brand-ice)] md:shadow-[18px_18px_0_var(--brand-ice)]"
      />

      <div>
        <SectionHeading id="host-heading" eyebrow="04 / Your host">
          Meet Luis Gomez.
        </SectionHeading>
        <p className="max-w-[62ch] text-base leading-[1.8] text-[#334d77] md:text-[15px] md:leading-[1.9]">
          {hostIntro.teaser}
        </p>
        <div className="mt-7 flex flex-wrap gap-x-8 gap-y-2">
          <Link
            href="/about#about-host"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-navy underline decoration-slate decoration-2 underline-offset-[6px] hover:decoration-navy"
          >
            More about Luis <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/episodes/ep-1-luis-gomez"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-navy underline decoration-slate decoration-2 underline-offset-[6px] hover:decoration-navy"
          >
            Hear my story in episode 1 <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </Section>
  );
}
