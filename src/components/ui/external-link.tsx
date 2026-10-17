import type { ComponentProps } from "react";

/**
 * Every link that leaves the site (approved convention, spec §3.3). It opens in a new tab, so
 * following it never stops an episode that's playing, says so to screen readers, and carries the
 * ↗ that marks off-site links (internal links use → for another page, ↓ for further down this one).
 */
export function ExternalLink({ children, ...props }: Omit<ComponentProps<"a">, "target" | "rel">) {
  return (
    <a target="_blank" rel="noreferrer" {...props}>
      {children} <span aria-hidden="true">↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
