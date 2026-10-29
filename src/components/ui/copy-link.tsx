"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { type MouseEvent, useEffect, useRef, useState } from "react";

type CopyLinkProps = {
  /** The URL to copy. Followed as a normal link without JavaScript, or if copying fails. */
  href: string;
  label: string;
  copiedLabel: string;
  /** Read out by screen readers after copying; can say more than the visible label. */
  announcement: string;
  className?: string;
};

/**
 * A link whose URL is copied rather than opened, for addresses that are only useful pasted into
 * another app (the RSS feed). Both labels share one grid cell, so the width doesn't jump.
 */
export function CopyLink({ href, label, copiedLabel, announcement, className }: CopyLinkProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  async function copy(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    try {
      await navigator.clipboard.writeText(href);
    } catch {
      window.open(href, "_blank", "noreferrer");
      return;
    }
    setCopied(true);
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopied(false), 4000);
  }

  return (
    <>
      <a href={href} onClick={copy} className={className}>
        {copied ? (
          <CheckIcon aria-hidden="true" className="size-3.5" />
        ) : (
          <CopyIcon aria-hidden="true" className="size-3.5" />
        )}
        <span className="grid">
          <span className={`col-start-1 row-start-1 ${copied ? "invisible" : ""}`}>{label}</span>
          <span className={`col-start-1 row-start-1 ${copied ? "" : "invisible"}`}>
            {copiedLabel}
          </span>
        </span>
      </a>
      <span role="status" className="sr-only">
        {copied ? announcement : ""}
      </span>
    </>
  );
}
