import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { NoticeSection } from "@/components/layout/NoticeSection";
import { Section } from "@/components/layout/Section";
import { ExternalLink } from "@/components/ui/external-link";
import { pageMetadata } from "@/lib/metadata";
import { contactEmail, siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Guest privacy",
  description: `How ${siteConfig.name} handles information from people who inquire about, apply to, or take part in the podcast.`,
  path: "/guest-privacy",
});

/** Publication date (host approval, Oct 28, 2026). Bump on every change. */
const LAST_UPDATED = { iso: "2026-10-28", label: "October 28, 2026" };

const linkClass = "font-bold text-navy underline underline-offset-4 hover:text-slate";

function List({ items }: { items: readonly string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-slate">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/** Marks host content still to be written; must be gone before launch (spec §13). */
function Placeholder({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-sm border border-dashed border-slate px-3 py-2 text-xs font-bold tracking-[0.08em] text-slate uppercase">
      Placeholder · {children}
    </p>
  );
}

const siteHost = new URL(siteConfig.url).host;

/**
 * Guest privacy notice, the host's text (Oct 28, 2026), headings in the site's sentence case.
 * Separate from /privacy, which covers website visitors; each links to the other.
 */
const sections: { id: string; heading: string; body: ReactNode }[] = [
  {
    id: "guest-privacy-collect",
    heading: "1. Information we collect",
    body: (
      <>
        <p>When you contact the podcast or express interest in becoming a guest, we may collect:</p>
        <List
          items={[
            "Your name or preferred name.",
            "Your email address and other contact information you voluntarily provide.",
            "Information about potential interview topics.",
            "Audio introductions or auditions submitted through Casting Call Club (these stay on Casting Call Club).",
            "Relevant links to websites, social media, or creative projects.",
            "Scheduling details and communications.",
            "Any other information you choose to share.",
          ]}
        />
        <p>
          If you&apos;re selected for an interview, we may also collect audio and video recordings,
          photographs provided for episode promotion, consent forms, and information shared during
          the conversation.
        </p>
        <p>
          You are not required to provide sensitive personal information when initially contacting
          the show.
        </p>
      </>
    ),
  },
  {
    id: "guest-privacy-use",
    heading: "2. How we use your information",
    body: (
      <>
        <p>Guest information may be used to:</p>
        <List
          items={[
            "Review potential guest inquiries and submissions.",
            "Contact you regarding an interview.",
            "Coordinate recording sessions.",
            "Prepare interview questions and episode materials.",
            "Record, edit, produce, and publish podcast content with your permission.",
            "Credit guests and link to their work, where agreed.",
            "Maintain records of permissions and guest agreements.",
            "Respond to questions, privacy concerns, or legal requests.",
          ]}
        />
        <p className="font-bold text-navy">We do not sell guest contact information.</p>
      </>
    ),
  },
  {
    id: "guest-privacy-recording",
    heading: "3. Recording and publication",
    body: (
      <>
        <p>
          Interviews may be recorded through Riverside or another recording service disclosed before
          the session.
        </p>
        <p>
          With your permission, recorded material may be edited and published as full video
          episodes, audio podcast episodes, excerpts, highlights, and promotional content.
        </p>
        <p>
          Once content is publicly released, it may be accessed, shared, downloaded, or retained by
          third parties beyond our control.
        </p>
        <p>
          The specific permissions governing your appearance will be explained in the Guest
          Appearance &amp; Recording Release.
        </p>
      </>
    ),
  },
  {
    id: "guest-privacy-services",
    heading: "4. Third-party services",
    body: (
      <>
        <p>
          We use third-party services to communicate with guests, coordinate interviews, record
          episodes, store files, and distribute content.
        </p>
        <p>These may include:</p>
        <List
          items={[
            "Casting Call Club, where we may post calls for guests. Submissions there stay on Casting Call Club under its own privacy policy for as long as the project post is active; we only take your email address or preferred contact details from it.",
            "Google Forms, for the guest application on our website and, if you're invited, the appearance and recording release.",
            "Riverside, for remote recordings.",
            "Email providers, for communications.",
            "Podcast hosting and video platforms, for publication.",
            "Social media platforms, for promotional content.",
          ]}
        />
        <p>These services may process information under their own privacy policies.</p>
        <p>
          For more information about Riverside, see the{" "}
          <ExternalLink href="https://riverside.com/privacy-policy" className={linkClass}>
            Riverside privacy policy
          </ExternalLink>
          .
        </p>
      </>
    ),
  },
  {
    id: "guest-privacy-access",
    heading: "5. Who can access your information?",
    body: (
      <>
        <p>
          Guest inquiries, private communications, unpublished recordings, and signed agreements are
          intended for podcast administration and production.
        </p>
        <p>
          Access may be given to people assisting with production, editing, or administration when
          reasonably necessary.
        </p>
        <p>
          We may also share information with service providers needed to operate the podcast, or
          where required by law.
        </p>
        <p>
          Information you agree to include in a published episode, episode description, or
          promotional material will become public.
        </p>
      </>
    ),
  },
  {
    id: "guest-privacy-retention",
    heading: "6. How long we keep information",
    body: (
      <>
        <p>
          We retain guest information only for as long as reasonably necessary for recruitment,
          communication, production, publication, recordkeeping, and legal purposes.
        </p>
        <p>
          If we decide not to move forward with an inquiry, we&apos;ll let you know, and we&apos;ll
          delete your inquiry and contact details within 6 months, unless you ask us to keep them
          for a future conversation.
        </p>
        <p>
          If a recorded interview can&apos;t be released, we&apos;ll talk with you about
          re-recording it or deleting it. If it isn&apos;t re-recorded, the recording is deleted.
        </p>
        <p>
          Published episodes and associated production materials may be retained for ongoing
          operation and archival purposes. Signed releases may be retained to document recording and
          publication permissions.
        </p>
        <p>
          You may contact us to ask about personal information associated with your inquiry or
          appearance.
        </p>
      </>
    ),
  },
  {
    id: "guest-privacy-choices",
    heading: "7. Your choices",
    body: (
      <>
        <p>You can choose what information to share when expressing interest in the podcast.</p>
        <p>You may also:</p>
        <List
          items={[
            "Decline an interview before recording.",
            "Ask questions about how your information will be used.",
            "Identify subjects you're uncomfortable discussing.",
            "Request correction of inaccurate contact information.",
            "Ask about deletion of information that is no longer needed.",
            "Contact us regarding privacy concerns or unintended disclosures.",
          ]}
        />
        <p>
          Requests involving published material will be evaluated in accordance with the guest
          agreement and applicable law.
        </p>
        <p>
          We cannot guarantee the removal of material already downloaded, copied, or distributed by
          third parties.
        </p>
      </>
    ),
  },
  {
    id: "guest-privacy-age",
    heading: "8. Age requirement",
    body: (
      <>
        <p>Guest opportunities are intended for adults aged 18 or older.</p>
        <p>
          If we discover that an applicant is under 18, we will not proceed with an interview under
          the adult guest process and will take appropriate steps to remove information that is not
          required to be retained.
        </p>
      </>
    ),
  },
  {
    id: "guest-privacy-changes",
    heading: "9. Changes to this notice",
    body: (
      <>
        <p>This notice may be updated as the podcast&apos;s practices or services change.</p>
        <p>
          The latest version will be available on our website with its updated publication date.
        </p>
      </>
    ),
  },
  {
    id: "guest-privacy-contact",
    heading: "10. Contact",
    body: (
      <>
        <p>
          For questions about guest privacy or information related to your participation, contact:
        </p>
        <dl className="grid grid-cols-[5.5rem_1fr] gap-x-4 gap-y-2">
          <dt className="font-bold text-navy">Show</dt>
          <dd>{siteConfig.name}</dd>
          <dt className="font-bold text-navy">Host</dt>
          <dd>{siteConfig.host}</dd>
          <dt className="font-bold text-navy">Email</dt>
          <dd className="break-all">
            {contactEmail ? (
              <a href={`mailto:${contactEmail}`} className={linkClass}>
                {contactEmail}
              </a>
            ) : (
              <Placeholder>contact email to be added before launch</Placeholder>
            )}
          </dd>
          <dt className="font-bold text-navy">Website</dt>
          <dd>
            <Link href="/" className={linkClass}>
              {siteHost}
            </Link>
          </dd>
        </dl>
      </>
    ),
  },
];

/**
 * Guest privacy notice, approved by the host on Oct 28, 2026 (including the §6 retention period
 * and the Casting Call Club wording). Long enough to need a contents list, which stays beside the
 * text from `lg`.
 */
export default function GuestPrivacyPage() {
  return (
    <>
      <Section tone="dark" aria-labelledby="guest-privacy-title">
        <p className="eyebrow text-ice">Guest privacy</p>
        <h1 id="guest-privacy-title" className="mt-4 display-xl text-balance">
          Guest privacy notice.
        </h1>
        <p className="mt-6 max-w-[60ch] text-lg text-pale">
          {siteConfig.name} respects the privacy of people who inquire about, apply to, or
          participate in the podcast. This notice explains what information may be collected, how it
          is used, and what happens when someone participates in a recorded interview.
        </p>
        <p className="mt-6 text-pale">
          Last updated <time dateTime={LAST_UPDATED.iso}>{LAST_UPDATED.label}</time>
        </p>
      </Section>

      <Section
        tone="paper"
        aria-label="Guest privacy notice details"
        containerClassName="grid items-start gap-10 lg:grid-cols-[minmax(0,240px)_minmax(0,68ch)] lg:gap-16"
      >
        <nav
          aria-labelledby="guest-privacy-contents"
          className="rounded-lg border border-line-light p-5 lg:sticky lg:top-12"
        >
          <h2 id="guest-privacy-contents" className="eyebrow text-slate">
            Contents
          </h2>
          <ol className="mt-3 text-sm">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="flex min-h-11 items-center py-1.5 font-semibold text-navy underline-offset-4 hover:underline"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="text-slate">
          {sections.map((section) => (
            <NoticeSection key={section.id} id={section.id} heading={section.heading}>
              {section.body}
            </NoticeSection>
          ))}
          <p className="mt-12 border-t border-line-light pt-6">
            For how this website handles visitors&apos; information, see the{" "}
            <Link href="/privacy" className={linkClass}>
              website privacy notice
            </Link>
            .
          </p>
        </div>
      </Section>
    </>
  );
}
