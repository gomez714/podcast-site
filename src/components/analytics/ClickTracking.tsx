"use client";

import { track } from "@vercel/analytics";
import { useEffect } from "react";

import { ANALYTICS_EVENTS, cleanTag, readTrackedClick } from "@/lib/analytics";

/**
 * `track()` silently drops events sent before `<Analytics />` has set up `window.va`, which is
 * exactly when the "Tagged visit" check runs. This creates the same queue `@vercel/analytics`
 * does (its `initQueue`); the script sends whatever is queued once it loads.
 */
function ensureAnalyticsQueue() {
  window.va ??= (...params: [string, unknown?]) => {
    (window.vaq ??= []).push(params);
  };
}

/**
 * Site-wide listener for the custom events in `src/lib/analytics.ts`. It reports clicks on links
 * and buttons inside elements marked with `trackClicks(...)`, and a "Tagged visit" when the page
 * was opened from a link tagged with `utm_source` (once per tag per browser session).
 */
export function ClickTracking() {
  useEffect(() => {
    ensureAnalyticsQueue();
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target?.closest("a, button")) return;
      const marked = target.closest<HTMLElement>("[data-track]");
      const click = marked && readTrackedClick(marked.dataset);
      if (click) track(click.event, click.properties);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  useEffect(() => {
    ensureAnalyticsQueue();
    const params = new URLSearchParams(window.location.search);
    const source = cleanTag(params.get("utm_source"));
    if (!source) return;
    const key = `tagged-visit:${source}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage can be blocked; counting a repeat visit is fine.
    }
    track(ANALYTICS_EVENTS.taggedVisit, {
      source,
      medium: cleanTag(params.get("utm_medium")) ?? "none",
    });
  }, []);

  return null;
}
