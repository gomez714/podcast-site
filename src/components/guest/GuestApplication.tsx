"use client";

import { type MouseEvent, useEffect, useRef, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { guestApplicationForm } from "@/lib/site";
import { cn } from "cn";

/** Tailwind's `md`, where the form loads in the page instead of a new tab. */
const EMBED_QUERY = "(min-width: 48rem)";

/**
 * The guest application (a Google Form), loaded only when asked for, like the YouTube poster, so
 * a visit never contacts Google on its own (/privacy says so). On phones the link opens Google's
 * full-screen form in a new tab, because an embedded form scrolls awkwardly inside a small page.
 * From `md` up the same link loads the form here instead. It's a real link to the form, so it
 * works without JavaScript. This hand-rolls the new-tab behaviour that `ExternalLink` gives other
 * off-site links, because the same element also has to work as an in-page control.
 */
export function GuestApplication({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!open) return;
    frameRef.current?.scrollIntoView({ block: "start" });
    frameRef.current?.focus();
  }, [open]);

  function openHere(event: MouseEvent<HTMLAnchorElement>) {
    if (!window.matchMedia(EMBED_QUERY).matches) return;
    event.preventDefault();
    setOpen(true);
  }

  return (
    <div className={className}>
      {open ? (
        <iframe
          ref={frameRef}
          id="guest-application-form"
          src={guestApplicationForm.embedUrl}
          title="Guest application form"
          height={guestApplicationForm.embedHeight}
          className="w-full scroll-mt-24 rounded-lg bg-white"
        />
      ) : (
        <a
          href={guestApplicationForm.url}
          target="_blank"
          rel="noreferrer"
          onClick={openHere}
          className={cn(buttonVariants({ variant: "primary", size: "cta" }), "w-full sm:w-auto")}
        >
          Open the application form
          <span aria-hidden="true" className="md:hidden">
            ↗
          </span>
          <span className="sr-only md:hidden"> (opens in a new tab)</span>
          <span aria-hidden="true" className="hidden md:inline">
            ↓
          </span>
        </a>
      )}
      <p className="mt-3 text-sm text-pale">
        No Google account needed.{" "}
        <a
          href={guestApplicationForm.url}
          target="_blank"
          rel="noreferrer"
          className="hidden font-bold text-ice underline underline-offset-4 hover:text-white md:inline"
        >
          Open it in a new tab instead <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </p>
    </div>
  );
}
