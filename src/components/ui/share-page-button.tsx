"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

const statusText = {
  idle: "",
  copied: "Link copied.",
  failed: "Couldn't copy the link. Copy it from your browser's address bar instead.",
} as const;

type ShareStatus = keyof typeof statusText;

type SharePageButtonProps = {
  title: string;
  /** Path of the page to share, e.g. "/be-a-guest"; shared without any #fragment. */
  path: string;
  className?: string;
};

/**
 * Opens the device's share sheet where there is one (phones), and otherwise copies the page's link.
 * The result is announced in a live region, since copying has no visible effect of its own.
 */
export function SharePageButton({ title, path, className }: SharePageButtonProps) {
  const [status, setStatus] = useState<ShareStatus>("idle");
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  function announce(next: ShareStatus) {
    setStatus(next);
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setStatus("idle"), 5000);
  }

  async function share() {
    const url = new URL(path, window.location.origin).toString();
    if ("share" in navigator) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        // Closing the share sheet isn't a failure; anything else falls back to copying.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      announce("copied");
    } catch {
      announce("failed");
    }
  }

  return (
    <div className={className}>
      <Button variant="solid" size="cta" onClick={share}>
        Share this page
      </Button>
      <p role="status" className="mt-3 min-h-6 text-sm font-semibold text-navy">
        {statusText[status]}
      </p>
    </div>
  );
}
