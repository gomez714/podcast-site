import type { ReactNode } from "react";

type NoticeSectionProps = {
  heading: string;
  /** Needed when a table of contents links to the section; unique per page. */
  id?: string;
  children: ReactNode;
};

/** One titled part of a notice page (`/privacy`, `/guest-privacy`). */
export function NoticeSection({ heading, id, children }: NoticeSectionProps) {
  return (
    <section id={id} aria-labelledby={id && `${id}-heading`} className="mt-10 first:mt-0">
      <h2 id={id && `${id}-heading`} className="text-lg font-bold text-navy">
        {heading}
      </h2>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}
