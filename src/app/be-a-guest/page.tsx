import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Section, SectionHeading } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/button-link";
import { SharePageButton } from "@/components/ui/share-page-button";
import {
  agreementTopics,
  conversationTopics,
  guestInquiry,
  guestPage,
  guestReferral,
  type GuestTopic,
} from "@/content/guest";
import { pageMetadata } from "@/lib/metadata";
import { contactEmail, siteConfig } from "@/lib/site";

import hostPhoto from "../../../public/images/host/luis-candid.jpg";

const PATH = "/be-a-guest";

export const metadata: Metadata = pageMetadata({
  title: "Be a guest",
  description: `How being a guest on ${siteConfig.name} works: who can take part, what the conversation is like, how it's recorded and published, and how to get in touch.`,
  path: PATH,
});

const bodyCopy =
  "max-w-[62ch] space-y-4 text-base leading-[1.8] text-[#334d77] md:text-[15px] md:leading-[1.9]";

const textLinkClass =
  "inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-navy underline decoration-slate decoration-2 underline-offset-[6px] hover:decoration-navy";

const mailto = contactEmail
  ? `mailto:${contactEmail}?subject=${encodeURIComponent(guestInquiry.subject)}`
  : undefined;

/**
 * Be a guest: how appearing on the show works, in the host's own words (`src/content/guest.ts`).
 * Everything stays visible rather than folded into accordions, because the consent and publishing
 * terms are things a guest should read, not have to find. The inquiry is an email, like /contact,
 * so the site still collects no personal data.
 */
export default function BeAGuestPage() {
  return (
    <>
      <Section
        tone="dark"
        aria-labelledby="guest-title"
        containerClassName="grid items-end gap-12 lg:grid-cols-[1fr_minmax(0,380px)] lg:gap-16"
      >
        <div>
          <p className="eyebrow text-ice">Be a guest</p>
          <h1 id="guest-title" className="mt-4 max-w-4xl display-xl text-balance">
            {guestPage.title}
          </h1>
          <p className="mt-6 max-w-[60ch] text-lg text-pale">
            {guestPage.prompts.join(" ")}{" "}
            <strong className="font-extrabold text-white">{guestPage.invitation}</strong>
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="#guest-inquiry" variant="primary">
              How to get in touch <span aria-hidden="true">↓</span>
            </ButtonLink>
            <ButtonLink href="#guest-who" variant="outline-on-dark">
              How it works <span aria-hidden="true">↓</span>
            </ButtonLink>
          </div>
        </div>

        <section
          aria-labelledby="guest-glance"
          className="rounded-lg border border-line-dark bg-white/5 p-6 sm:p-7"
        >
          <h2 id="guest-glance" className="eyebrow text-ice">
            At a glance
          </h2>
          <dl className="mt-5 divide-y divide-line-dark">
            {guestPage.atAGlance.map((item) => (
              <div key={item.term} className="grid grid-cols-[5.5rem_1fr] gap-4 py-3">
                <dt className="text-xs font-extrabold tracking-[0.08em] text-ice uppercase">
                  {item.term}
                </dt>
                <dd className="text-sm leading-normal font-semibold text-white">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </section>
      </Section>

      <Section
        tone="light"
        aria-label="A note from the host"
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
          <div className={bodyCopy}>
            {guestPage.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <Link href="/about#about-host" className={`mt-7 ${textLinkClass}`}>
            More about Luis <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Section>

      <Section tone="paper" aria-label="The conversation">
        <TopicList topics={conversationTopics} />
      </Section>

      <Section tone="light" aria-label="Publishing, pay and consent">
        <TopicList topics={agreementTopics} />
      </Section>

      <Section
        tone="dark"
        id="guest-inquiry"
        aria-labelledby="guest-inquiry-heading"
        containerClassName="grid items-start gap-12 lg:grid-cols-[1fr_minmax(0,460px)] lg:gap-16"
      >
        <div>
          <SectionHeading id="guest-inquiry-heading" eyebrow="Get in touch">
            {guestInquiry.heading}
          </SectionHeading>
          <div className="max-w-[60ch] space-y-4 text-lg text-pale">
            {guestInquiry.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-pale p-6 text-navy sm:p-8">
          {mailto ? (
            <>
              <dl className="space-y-4">
                <div>
                  <dt className="eyebrow text-slate">Email</dt>
                  <dd className="mt-1.5 text-lg font-extrabold break-all">{contactEmail}</dd>
                </div>
                <div>
                  <dt className="eyebrow text-slate">Subject</dt>
                  <dd className="mt-1.5 text-base font-bold">{guestInquiry.subject}</dd>
                </div>
              </dl>
              <ButtonLink href={mailto} variant="solid" className="mt-7 w-full sm:w-auto">
                Email a guest inquiry
              </ButtonLink>
              <p className="mt-3 text-sm text-slate">
                Opens your email app with the subject filled in.
              </p>
            </>
          ) : (
            <p className="inline-flex items-center gap-2 rounded-sm border border-dashed border-slate px-3 py-2 text-xs font-bold tracking-[0.08em] text-slate uppercase">
              Placeholder · contact email to be added before launch
            </p>
          )}
          <p className="mt-6 border-t border-navy/15 pt-5 text-sm leading-relaxed font-semibold">
            {guestInquiry.privacyNote}
          </p>
          <Link
            href="/guest-privacy"
            className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-navy underline decoration-slate decoration-2 underline-offset-[6px] hover:decoration-navy"
          >
            How guest information is handled <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Section>

      <Section tone="light" aria-labelledby="guest-referral-heading">
        <SectionHeading id="guest-referral-heading" eyebrow="Pass it on">
          {guestReferral.heading}
        </SectionHeading>
        <div className={bodyCopy}>
          {guestReferral.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <SharePageButton title={`Be a guest on ${siteConfig.name}`} path={PATH} className="mt-8" />
        <p className="mt-6 max-w-[40ch] font-display text-[clamp(1.5rem,3vw,2rem)] leading-tight font-extrabold text-balance text-navy uppercase">
          {guestReferral.closing}
        </p>
      </Section>
    </>
  );
}

/** One row per question: the question on the left from `md`, the answer beside it. */
function TopicList({ topics }: { topics: readonly GuestTopic[] }) {
  return (
    <div className="divide-y divide-line-light">
      {topics.map((topic) => (
        <article
          key={topic.id}
          aria-labelledby={`${topic.id}-heading`}
          id={topic.id}
          className="grid gap-5 py-10 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,320px)_1fr] md:gap-12 md:py-14 md:first:pt-0 md:last:pb-0"
        >
          <h2
            id={`${topic.id}-heading`}
            className="font-display text-[clamp(1.6rem,2.8vw,2.25rem)] leading-[1.02] font-extrabold text-balance text-navy uppercase"
          >
            {topic.question}
          </h2>
          <div className={bodyCopy}>
            {topic.lead && <p className="text-lg font-extrabold text-navy">{topic.lead}</p>}
            {topic.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {topic.list && (
              <ul className="list-disc space-y-2 pl-5 marker:text-slate">
                {topic.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {topic.after?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {topic.note && (
              <p className="border-l-4 border-ice pl-4 font-bold text-navy">{topic.note}</p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
