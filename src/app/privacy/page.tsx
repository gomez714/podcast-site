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
const LAST_UPDATED = { iso: "2026-10-29", label: "October 29, 2026" };

const linkClass = "font-bold text-navy underline underline-offset-4 hover:text-slate";

/**
 * Privacy notice (spec §12.6), approved by the host on Oct 28, 2026. It describes only what
 * the site actually does today: no cookies, cookie-free Vercel Web Analytics and Speed Insights
 * (with the custom events in `src/lib/analytics.ts`), third parties only for playback, and the
 * guest application's Google Form, loaded only on request. Update the "Analytics" block if events
 * change.
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
              This website doesn&apos;t use cookies or advertising trackers, and has no accounts. It
              counts visits and a few clicks with cookie-free analytics, so the show can see which
              episodes people find and whether they go on to follow it. The only form is the
              optional guest application, run by Google Forms, which loads only if you open it. A
              few outside services are involved in playing episodes, explained below.
            </p>
          </NoticeSection>

          <NoticeSection heading="Listening to episodes">
            <p>
              Episode audio is hosted by Fusebox, the show&apos;s podcast host. Opening an episode
              page doesn&apos;t contact Fusebox; nothing is requested until you press play, and then
              the audio streams from Fusebox. Like any request to another website, this shares your
              IP address and browser details with Fusebox.
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
              <ExternalLink href="https://vercel.com/legal/privacy-notice" className={linkClass}>
                Vercel privacy notice
              </ExternalLink>
              .
            </p>
          </NoticeSection>

          <NoticeSection heading="Analytics">
            <p>
              The site uses Vercel Web Analytics and Speed Insights. They count page views, where
              visits come from (for example Instagram or a search engine), the country, the type of
              device and browser, and how quickly pages load. They also count a few clicks: links to
              the show on listening apps and social media, pressing play, and opening the guest
              application. They don&apos;t record anything you type, and no names or email addresses
              are sent.
            </p>
            <p>
              No cookies are used. Vercel tells visits apart using a code made from the request that
              resets every day, rather than storing anything on your device, and the show only sees
              totals, not individual visitors.
            </p>
            <p>
              See the{" "}
              <ExternalLink href="https://vercel.com/legal/privacy-notice" className={linkClass}>
                Vercel privacy notice
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

          <NoticeSection heading="Guest application form">
            <p>
              The guest application on the{" "}
              <Link href="/be-a-guest" className={linkClass}>
                Be a guest
              </Link>{" "}
              page is a Google Form. Nothing is sent to Google until you press the button to open
              it. Answers you submit are collected by Google Forms and handled as the guest privacy
              notice explains.
            </p>
            <p>
              See the{" "}
              <ExternalLink href="https://policies.google.com/privacy" className={linkClass}>
                Google privacy policy
              </ExternalLink>
              .
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
              . If the site&apos;s practices change, for example by counting something new, this
              page will be updated and the date above will change.
            </p>
          </NoticeSection>
        </div>
      </Section>
    </>
  );
}
