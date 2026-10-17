import Link from "next/link";

import { Section, SectionHeading } from "@/components/layout/Section";

/**
 * About the host (spec §5.1 item 6). PLACEHOLDER: the introduction copy is waiting on the host.
 * There is deliberately no portrait until an approved photo is supplied; the pane illustration
 * stands in for it.
 */
export function HostTeaser({
  eyebrow = "04 / Your host",
  headingId = "host-heading",
  sectionId = "host",
  tone = "light",
}: {
  eyebrow?: string;
  /** Unique per page: Next keeps visited pages in the DOM, so the About page passes its own ids. */
  headingId?: string;
  sectionId?: string;
  tone?: "light" | "paper";
}) {
  return (
    <Section
      tone={tone}
      id={sectionId}
      aria-labelledby={headingId}
      containerClassName="grid items-center gap-[clamp(2.5rem,7vw,6.5rem)] md:grid-cols-[minmax(0,300px)_1fr]"
    >
      <PaneIllustration />

      <div>
        <SectionHeading id={headingId} eyebrow={eyebrow}>
          Meet Luis Gomez.
        </SectionHeading>
        <p className="mb-5 inline-flex items-center gap-2 rounded-sm border border-dashed border-slate px-2.5 py-1 text-[11px] font-bold tracking-[0.08em] text-slate uppercase">
          Placeholder copy · replace before launch
        </p>
        <div className="max-w-[62ch] space-y-4 text-base leading-[1.8] text-[#334d77] md:text-[15px] md:leading-[1.9]">
          <p>
            A short introduction from Luis will go here: who he is, why he started The Bottom Left
            Pane, and what he listens for in a conversation.
          </p>
          <p>Two or three sentences is plenty. The guests stay at the center of the show.</p>
        </div>
        <Link
          href="/episodes/ep-1-luis-gomez"
          className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-navy underline decoration-slate decoration-2 underline-offset-[6px] hover:decoration-navy"
        >
          Hear his story in episode 1 <span aria-hidden="true">→</span>
        </Link>
      </div>
    </Section>
  );
}

/** The four-pane mark at illustration scale, with the bottom-left pane lit. */
function PaneIllustration() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto grid aspect-square w-full max-w-[120px] grid-cols-2 gap-[6%] rounded-lg bg-navy p-4 shadow-[10px_10px_0_var(--brand-ice)] md:max-w-none md:p-[14%] md:shadow-[18px_18px_0_var(--brand-ice)]"
    >
      <span className="rounded-[3px] bg-slate" />
      <span className="rounded-[3px] bg-slate" />
      <span className="rounded-[3px] bg-pale shadow-[0_0_40px_rgb(93_198_255/0.55)]" />
      <span className="rounded-[3px] bg-slate" />
    </div>
  );
}
