/**
 * Vercel Web Analytics custom events (host's choice, Oct 29, 2026). The included Pro plan allows
 * two properties per event. Never put personal data in a property: no names, emails or anything
 * typed into a form. `/privacy` describes these events; update it if you add one.
 *
 * - Platform click: a link to the show on Apple Podcasts, Spotify, YouTube or Instagram, or
 *   "Copy RSS feed". This is the site's primary goal (spec §1.3–1.4).
 * - Play pressed: someone started an episode in the site's player. Not a listen: Fusebox stays
 *   the source of truth for listens (spec §7.5).
 * - Guest application: the guest form was opened, or the guest email link was clicked.
 * - Tagged visit: someone arrived through a link tagged with `utm_source`, such as an Instagram or
 *   YouTube bio link. Counted as an event because the UTM report needs Web Analytics Plus.
 */
export const ANALYTICS_EVENTS = {
  platformClick: "Platform click",
  playPressed: "Play pressed",
  guestApplication: "Guest application",
  taggedVisit: "Tagged visit",
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/**
 * `data-*` attributes that make `ClickTracking` report clicks on a link (or on a link inside the
 * element). Lets server components be tracked without becoming client components.
 */
export function trackClicks(
  event: AnalyticsEvent,
  properties: Readonly<Record<string, string>>,
): Record<`data-${string}`, string> {
  const attributes: Record<`data-${string}`, string> = { "data-track": event };
  for (const [key, value] of Object.entries(properties)) attributes[`data-track-${key}`] = value;
  return attributes;
}

/** Reads the event and properties back from an element's dataset (see `trackClicks`). */
export function readTrackedClick(
  dataset: DOMStringMap,
): { event: string; properties: Record<string, string> } | undefined {
  const event = dataset.track;
  if (!event) return undefined;
  const properties: Record<string, string> = {};
  for (const [key, value] of Object.entries(dataset)) {
    if (key === "track" || !key.startsWith("track") || value === undefined) continue;
    const name = key.slice("track".length);
    properties[name.charAt(0).toLowerCase() + name.slice(1)] = value;
  }
  return { event, properties };
}

/**
 * A UTM value safe to send: lowercase letters, digits, `-` and `_`, at most 40 characters. Tags
 * are typed by hand into bio links, so anything else is dropped rather than reported.
 */
export function cleanTag(value: string | null): string | undefined {
  const cleaned = value
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 40);
  return cleaned || undefined;
}
