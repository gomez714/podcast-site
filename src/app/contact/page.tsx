import type { Metadata } from "next";

import { Section } from "@/components/layout/Section";
import { ExternalLink } from "@/components/ui/external-link";
import { pageMetadata } from "@/lib/metadata";
import { contactEmail, platformLinks, siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: `How to get in touch with ${siteConfig.name}.`,
  path: "/contact",
});

const platformLinkClass =
  "inline-flex min-h-11 items-center gap-2 rounded-md border border-navy px-3.5 text-xs font-bold whitespace-nowrap text-navy hover:bg-pale";

/**
 * Contact page (spec §5.5): one monitored, public contact method. PLACEHOLDER until the host
 * chooses an address (`contactEmail` in `src/lib/site.ts`); no form, so no personal data collected.
 */
export default function ContactPage() {
  return (
    <>
      <Section tone="dark" aria-labelledby="contact-title">
        <p className="eyebrow text-ice">Contact</p>
        <h1 id="contact-title" className="mt-4 display-xl text-balance">
          Get in touch.
        </h1>
        <p className="mt-6 max-w-[60ch] text-lg text-pale">
          Questions about the show or one of its episodes? Send an email and it will reach the host.
        </p>

        <div className="mt-10">
          {contactEmail ? (
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex min-h-12 items-center rounded-md bg-pale px-5.5 text-sm font-extrabold text-navy hover:bg-white"
            >
              {contactEmail}
            </a>
          ) : (
            <p className="inline-flex items-center gap-2 rounded-sm border border-dashed border-ice px-3 py-2 text-xs font-bold tracking-[0.08em] text-ice uppercase">
              Placeholder · contact email to be added before launch
            </p>
          )}
        </div>
      </Section>

      <Section tone="light" aria-labelledby="contact-follow">
        <h2
          id="contact-follow"
          className="font-display text-[clamp(1.9rem,3.4vw,2.75rem)] leading-none font-extrabold uppercase"
        >
          Listen and follow
        </h2>
        <p className="mt-4 max-w-[60ch] text-slate">
          Follow the show wherever you listen to hear when new episodes arrive.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2.5">
          {platformLinks.map((platform) => (
            <li key={platform.href}>
              <ExternalLink href={platform.href} className={platformLinkClass}>
                {platform.label}
              </ExternalLink>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
