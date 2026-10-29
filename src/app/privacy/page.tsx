import type { Metadata } from "next";
import Link from "next/link";

import { NoticeSection } from "@/components/layout/NoticeSection";
import { Section } from "@/components/layout/Section";
import { ExternalLink } from "@/components/ui/external-link";
import { pageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description: `What ${siteConfig.name} website does, and doesn't do, with information about visitors.`,
  path: "/privacy",
});

/** Bump when the notice changes. */
const LAST_UPDATED = { iso: "2026-10-28", label: "October 28, 2026" };

const linkClass = "font-bold text-navy underline underline-offset-4 hover:text-slate";

/**
 * Privacy notice (spec §12.6), approved by the host on Oct 28, 2026. It describes only what
 * the site actually does today: no cookies, no analytics, no forms, and third parties only for
 * playback. If analytics are added (e.g. Vercel Web Analytics), add an "Analytics" block below.
 */
export default function PrivacyPage() {
  return (
    <>
      <Section tone="dark" aria-labelledby="privacy-title">
        <p className="eyebrow text-ice">Privacy</p>
        <h1 id="privacy-title" className="mt-4 display-xl text-balance">
          Privacy notice.
        </h1>
        <p className="mt-6 text-pale">
          Last updated <time dateTime={LAST_UPDATED.iso}>{LAST_UPDATED.label}</time>
        </p>
      </Section>

      <Section tone="paper" aria-label="Privacy notice details">
        <div className="max-w-[68ch] text-slate">
          <NoticeSection heading="The short version">
            <p>
              This website doesn&apos;t use cookies, doesn&apos;t run analytics or advertising
              trackers, and has no accounts or forms, so it doesn&apos;t ask you for any personal
              information. A few outside services are involved in playing episodes, explained below.
            </p>
          </NoticeSection>

          <NoticeSection heading="Listening to episodes">
            <p>
              Episode audio is hosted by Fusebox, the show&apos;s podcast host. When you open an
              episode page, your browser asks Fusebox for basic details about the audio file, such
              as its length. When you press play, the audio streams from Fusebox. Like any request
              to another website, this shares your IP address and browser details with Fusebox.
            </p>
            <p>
              See the{" "}
              <ExternalLink href="https://fusebox.fm/privacy-policy/" className={linkClass}>
                Fusebox privacy policy
              </ExternalLink>
              .
            </p>
          </NoticeSection>

          <NoticeSection heading="Watching videos">
            <p>
              Filmed episodes can be watched through YouTube, using its privacy-enhanced mode
              (youtube-nocookie.com). Nothing loads from YouTube until you press a video&apos;s play
              button; the preview images are served from this site. Once a video starts,
              YouTube&apos;s own policy applies.
            </p>
            <p>
              See the{" "}
              <ExternalLink href="https://policies.google.com/privacy" className={linkClass}>
                Google privacy policy
              </ExternalLink>
              .
            </p>
          </NoticeSection>

          <NoticeSection heading="Hosting">
            <p>
              The site is hosted by Vercel. Like any web host, it processes basic request details,
              such as IP addresses, to deliver pages and keep the service secure.
            </p>
            <p>
              See the{" "}
              <ExternalLink href="https://vercel.com/legal/privacy-policy" className={linkClass}>
                Vercel privacy policy
              </ExternalLink>
              .
            </p>
          </NoticeSection>

          <NoticeSection heading="Fonts and images">
            <p>
              Fonts and images are served from this site, so viewing a page doesn&apos;t contact a
              font service or image host.
            </p>
          </NoticeSection>

          <NoticeSection heading="Links to other sites">
            <p>
              Links to Apple Podcasts, Spotify, YouTube and Instagram open in a new tab. Those
              services have their own privacy policies.
            </p>
          </NoticeSection>

          <NoticeSection heading="Guests">
            <p>
              If you contact the show about being a guest, or appear on it, the{" "}
              <Link href="/guest-privacy" className={linkClass}>
                guest privacy notice
              </Link>{" "}
              explains how that information is handled.
            </p>
          </NoticeSection>

          <NoticeSection heading="Questions and changes">
            <p>
              If you have a question about this notice, see the{" "}
              <Link href="/contact" className={linkClass}>
                contact page
              </Link>
              . If the site&apos;s practices change, for example by adding analytics, this page will
              be updated and the date above will change.
            </p>
          </NoticeSection>
        </div>
      </Section>
    </>
  );
}
