import { DEFAULT_PODCAST_RSS_URL } from "./rss/config";

export const siteConfig = {
  name: "The Bottom Left Pane",
  tagline: "A podcast about human stories",
  description:
    "An interview podcast about the experiences, perspectives and parts of ourselves that don't always make it into everyday conversation.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://bottomleftpane.com",
  rssUrl: process.env.PODCAST_RSS_URL ?? DEFAULT_PODCAST_RSS_URL,
  locale: "en_US",
} as const;

export type NavItem = { label: string; href: string };

/** Header navigation (spec §5). "Find the show" is rendered separately as the outlined call to action. */
export const mainNav: NavItem[] = [
  { label: "Episodes", href: "/episodes" },
  { label: "About", href: "/about" },
  { label: "The Return", href: "/#revival" },
];

export const followNavItem: NavItem = { label: "Find the show", href: "/#listen" };
