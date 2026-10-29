import { DEFAULT_PODCAST_RSS_URL } from "./rss/config";

export const siteConfig = {
  name: "The Bottom Left Pane",
  tagline: "A podcast about human stories",
  description:
    "An interview podcast about the experiences, perspectives and parts of ourselves that don't always make it into everyday conversation.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://bottomleftpane.com",
  rssUrl: process.env.PODCAST_RSS_URL ?? DEFAULT_PODCAST_RSS_URL,
  locale: "en_US",
  host: "Luis Gomez",
} as const;

/**
 * The public contact address (spec §5.5), chosen by the host on Oct 17, 2026. Never fall back to
 * the RSS `<itunes:owner>` address.
 */
export const contactEmail: string | undefined = "bottomleftpane@gmail.com";

export type NavItem = { label: string; href: string };

/** Header navigation (spec §5). "Find the show" is rendered separately as the outlined call to action. */
export const mainNav: NavItem[] = [
  { label: "Episodes", href: "/episodes" },
  { label: "About", href: "/about" },
  { label: "The Return", href: "/#revival" },
];

/** Footer-only pages, listed after the main navigation in the footer's bottom bar. */
export const secondaryNav: NavItem[] = [
  { label: "Be a guest", href: "/be-a-guest" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
];

/** The footer is on every page, so this jumps within the current page rather than to the homepage. */
export const followNavItem: NavItem = { label: "Find the show", href: "#listen" };

/** Owned listening and social accounts, confirmed by the host on Oct 16, 2026. */
export const platformLinks: NavItem[] = [
  {
    label: "Apple Podcasts",
    href: "https://podcasts.apple.com/us/podcast/the-bottom-left-pane/id1723244219",
  },
  { label: "Spotify", href: "https://open.spotify.com/show/3huZ7oCzVXxXMpkbUtxR1d" },
  { label: "YouTube", href: "https://www.youtube.com/@BottomLeftPane" },
  { label: "Instagram", href: "https://www.instagram.com/bottomleftpane" },
];
