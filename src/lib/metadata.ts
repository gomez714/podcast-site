import type { Metadata } from "next";

import { defaultSocialImage } from "./default-social-image";
import { siteConfig } from "./site";

type SocialImage = { url: string; width?: number; height?: number; alt?: string };

type PageMetadataInput = {
  /** Page title; the root layout's template adds " · The Bottom Left Pane" to the document title. */
  title: string;
  description: string;
  /** Path for the canonical and `og:url`, e.g. "/episodes". Resolved against `metadataBase`. */
  path: string;
  /** Use the title as-is for the document title instead of applying the template (homepage). */
  absoluteTitle?: boolean;
  /** Defaults to the site-wide share image. */
  images?: SocialImage[];
  type?: "website" | "article";
  publishedTime?: string;
};

/**
 * Per-page metadata with matching Open Graph and X/Twitter fields. Next merges metadata shallowly,
 * so a page that sets `openGraph` replaces the layout's entirely and an unset `twitter` keeps the
 * layout's site-wide title; building both here keeps every share preview specific to the page.
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle,
  images = [defaultSocialImage],
  type = "website",
  publishedTime,
}: PageMetadataInput): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      url: path,
      title,
      description,
      images,
      ...(publishedTime && { publishedTime }),
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
}
