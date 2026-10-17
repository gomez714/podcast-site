import { describe, expect, it } from "vitest";

import { episodeEditorial, featuredEpisodeSlugs } from "@/content/episodes";
import thumbnails from "@/data/episode-thumbnails.json";
import snapshot from "@/data/episodes.snapshot.json";
import {
  buildEpisodeViews,
  getAllEpisodes,
  getEpisodeBySlug,
  getFeaturedEpisodes,
  selectBySlugs,
  selectRelated,
} from "@/lib/episodes/repository";
import { episodeSnapshotSchema, episodeThumbnailManifestSchema } from "@/lib/episodes/schema";
import type { EpisodeEditorial } from "@/lib/episodes/types";
import { formatDuration, formatEpisodeDate } from "@/lib/format";

const episodes = episodeSnapshotSchema.parse(snapshot).episodes;
const manifest = episodeThumbnailManifestSchema.parse(thumbnails);

describe("episode repository", () => {
  it("returns all eight episodes newest first with unique slugs", () => {
    const all = getAllEpisodes();
    expect(all.map((episode) => episode.episodeNumber)).toEqual([8, 7, 6, 5, 4, 3, 2, 1]);
    expect(new Set(all.map((episode) => episode.slug)).size).toBe(8);
  });

  it("names each guest in their episode title", () => {
    for (const episode of getAllEpisodes()) {
      if (episode.episodeNumber === 5) continue; // The title names the topics, not Devin.
      expect(episode.title).toContain(episode.guestName.split(" ")[0]);
    }
  });

  it("marks only episodes with a confirmed video as audio-video, with their own thumbnail", () => {
    for (const episode of getAllEpisodes()) {
      expect(episode.hasVideo).toBe(Boolean(episode.youtubeId));
      expect(episode.mediaKind).toBe(episode.youtubeId ? "audio-video" : "audio-only");
      expect(episode.artwork.kind).toBe(episode.youtubeId ? "youtube" : "fallback");
    }
    expect(getEpisodeBySlug("ep-1-luis-gomez")?.mediaKind).toBe("audio-only");
    expect(getEpisodeBySlug("ep-8-yuko-sasaki")?.mediaKind).toBe("audio-only");
  });

  it("keeps the explicit flag from the feed", () => {
    expect(
      getAllEpisodes()
        .filter((episode) => episode.explicit)
        .map((e) => e.slug),
    ).toEqual(["ep-3-simon-guerard"]);
  });

  it("shows content notes only where the host approved them", () => {
    expect(
      getAllEpisodes()
        .filter((episode) => episode.contentNote)
        .map((e) => e.slug),
    ).toEqual(["ep-5-devin", "ep-4-kate-conwell"]);
  });

  it("resolves the featured picks in curated order", () => {
    expect(getFeaturedEpisodes().map((episode) => episode.slug)).toEqual(featuredEpisodeSlugs);
    expect(getFeaturedEpisodes().map((episode) => episode.episodeNumber)).toEqual([3, 6, 8]);
  });

  it("returns undefined for an unknown slug", () => {
    expect(getEpisodeBySlug("ep-99-nobody")).toBeUndefined();
  });

  it("fails loudly on an unknown featured slug", () => {
    expect(() => selectBySlugs(getAllEpisodes(), ["ep-99-nobody"])).toThrow(/ep-99-nobody/);
  });

  it("fills related episodes with the newest others, never the episode itself", () => {
    const all = getAllEpisodes();
    const newest = all[0];
    expect(selectRelated(all, newest).map((e) => e.episodeNumber)).toEqual([7, 6, 5]);
    expect(selectRelated(all, all[3]).map((e) => e.episodeNumber)).toEqual([8, 7, 6]);
  });

  it("puts curated related episodes first", () => {
    const all = getAllEpisodes();
    const curated = { ...all[0], relatedSlugs: ["ep-1-luis-gomez"] };
    expect(selectRelated(all, curated).map((e) => e.episodeNumber)).toEqual([1, 7, 6]);
  });
});

describe("buildEpisodeViews guards", () => {
  const withEntry = (patch: Partial<EpisodeEditorial>) =>
    episodeEditorial.map((entry) =>
      entry.slug === "ep-8-yuko-sasaki" ? { ...entry, ...patch } : entry,
    );

  it("fails when an episode has no editorial entry", () => {
    expect(() => buildEpisodeViews(episodes, episodeEditorial.slice(1), manifest)).toThrow(
      /ep-1-luis-gomez" has no editorial entry/,
    );
  });

  it("fails when an editorial entry matches no episode", () => {
    const extra = { ...episodeEditorial[0], slug: "ep-99-nobody" };
    expect(() => buildEpisodeViews(episodes, [...episodeEditorial, extra], manifest)).toThrow(
      /ep-99-nobody" has no matching episode/,
    );
  });

  it("fails when a video has no downloaded thumbnail", () => {
    expect(() =>
      buildEpisodeViews(episodes, withEntry({ youtubeId: "AAAAAAAAAAA" }), manifest),
    ).toThrow(/assets:thumbnails/);
  });

  it("rejects a malformed YouTube ID", () => {
    expect(() =>
      buildEpisodeViews(episodes, withEntry({ youtubeId: "not-an-id" }), manifest),
    ).toThrow(/YouTube video ID/);
  });

  it("rejects related slugs that are unknown or point at the episode itself", () => {
    expect(() =>
      buildEpisodeViews(episodes, withEntry({ relatedSlugs: ["ep-99-nobody"] }), manifest),
    ).toThrow(/unknown related episode "ep-99-nobody"/);
    expect(() =>
      buildEpisodeViews(episodes, withEntry({ relatedSlugs: ["ep-8-yuko-sasaki"] }), manifest),
    ).toThrow(/lists itself/);
  });

  it("accepts only https guest links", () => {
    const link = (href: string) => withEntry({ guestLinks: [{ label: "Site", href }] });
    expect(() => buildEpisodeViews(episodes, link("https://example.com"), manifest)).not.toThrow();
    expect(() => buildEpisodeViews(episodes, link("http://example.com"), manifest)).toThrow();
    expect(() => buildEpisodeViews(episodes, link("javascript:alert(1)"), manifest)).toThrow();
  });
});

describe("formatting", () => {
  it("formats dates in UTC", () => {
    expect(formatEpisodeDate("2024-01-02T05:30:00.000Z")).toBe("Jan 2, 2024");
    expect(formatEpisodeDate("2023-12-31T23:30:00.000Z")).toBe("Dec 31, 2023");
  });

  it("rounds durations to whole minutes", () => {
    expect(formatDuration(3344)).toBe("56 min");
    expect(formatDuration(20)).toBe("1 min");
  });
});
