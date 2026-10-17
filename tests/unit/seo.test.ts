import { describe, expect, it } from "vitest";

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { getAllEpisodes, getEpisodeBySlug } from "@/lib/episodes/repository";
import { pageMetadata } from "@/lib/metadata";
import { platformLinks, siteConfig } from "@/lib/site";
import { isoDuration, podcastEpisodeJsonLd, podcastSeriesJsonLd } from "@/lib/structured-data";

describe("isoDuration", () => {
  it("formats seconds as ISO 8601 durations", () => {
    expect(isoDuration(1338)).toBe("PT22M18S");
    expect(isoDuration(3723)).toBe("PT1H2M3S");
    expect(isoDuration(3600)).toBe("PT1H");
    expect(isoDuration(0)).toBe("PT0S");
  });
});

describe("structured data", () => {
  it("describes the series with verified facts only", () => {
    const series = podcastSeriesJsonLd();
    expect(series).toMatchObject({
      "@type": "PodcastSeries",
      name: siteConfig.name,
      webFeed: siteConfig.rssUrl,
      author: { "@type": "Person", name: "Luis Gomez" },
    });
    expect(series.sameAs).toEqual(platformLinks.map((link) => link.href));
    expect(series.image).toMatch(/^https:\/\/.+\/images\/brand\/cover-art\.jpg$/);
  });

  it("describes an episode with its own audio, date and duration", () => {
    const episode = getEpisodeBySlug("ep-1-luis-gomez")!;
    const data = podcastEpisodeJsonLd(episode, "/images/brand/episode-fallback.jpg");
    expect(data).toMatchObject({
      "@type": "PodcastEpisode",
      name: episode.title,
      datePublished: episode.publishedAt,
      episodeNumber: 1,
      timeRequired: isoDuration(episode.durationSeconds!),
      associatedMedia: { "@type": "MediaObject", contentUrl: episode.audioUrl },
      partOfSeries: { "@type": "PodcastSeries", name: siteConfig.name },
    });
    expect(data.url).toBe(new URL("/episodes/ep-1-luis-gomez", siteConfig.url).toString());
  });
});

describe("sitemap and robots", () => {
  it("lists every page and every episode once, with absolute URLs", () => {
    const urls = sitemap().map((entry) => entry.url);
    const paths = urls.map((url) => new URL(url).pathname);
    expect(paths).toEqual(
      expect.arrayContaining(["/", "/episodes", "/about", "/contact", "/privacy"]),
    );
    for (const episode of getAllEpisodes()) expect(paths).toContain(`/episodes/${episode.slug}`);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.every((url) => url.startsWith(siteConfig.url))).toBe(true);
  });

  it("points crawlers at the sitemap", () => {
    expect(robots().sitemap).toBe(new URL("/sitemap.xml", siteConfig.url).toString());
  });
});

describe("page metadata", () => {
  it("keeps the share preview specific to the page", () => {
    const metadata = pageMetadata({ title: "About", description: "About it.", path: "/about" });
    expect(metadata.alternates?.canonical).toBe("/about");
    expect(metadata.openGraph).toMatchObject({
      title: "About",
      url: "/about",
      siteName: siteConfig.name,
    });
    expect(metadata.twitter).toMatchObject({ title: "About", description: "About it." });
  });
});
