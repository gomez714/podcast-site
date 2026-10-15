import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { episodeSlugsByGuid } from "@/content/episode-slugs";
import { buildEpisodeInventory, EpisodeInventoryError } from "@/lib/episodes/inventory";
import { episodeSnapshotSchema } from "@/lib/episodes/schema";
import { parseFeed } from "@/lib/rss/parse-feed";

const fixtureXml = readFileSync(path.join(__dirname, "..", "fixtures", "fusebox-feed.xml"), "utf8");
const { episodes } = parseFeed(fixtureXml);

describe("buildEpisodeInventory", () => {
  it("assigns a unique reviewed slug to every fixture episode", () => {
    const inventory = buildEpisodeInventory(episodes, episodeSlugsByGuid);
    expect(inventory.map((e) => [e.episodeNumber, e.slug])).toEqual([
      [8, "ep-8-yuko-sasaki"],
      [7, "ep-7-alekson"],
      [6, "ep-6-jurate-wolfe"],
      [5, "ep-5-devin"],
      [4, "ep-4-kate-conwell"],
      [3, "ep-3-simon-guerard"],
      [2, "ep-2-razie"],
      [1, "ep-1-luis-gomez"],
    ]);
  });

  it("refuses to invent a slug for an unmapped episode", () => {
    expect(() => buildEpisodeInventory(episodes, {})).toThrow(EpisodeInventoryError);
  });

  it("rejects duplicate and malformed slugs", () => {
    const [first, second] = episodes;
    const run = (slugs: Record<string, string>) => () =>
      buildEpisodeInventory([first, second], slugs);

    expect(run({ [first.sourceGuid]: "same", [second.sourceGuid]: "same" })).toThrow(
      /assigned to both/,
    );
    expect(run({ [first.sourceGuid]: "Bad Slug", [second.sourceGuid]: "ok" })).toThrow(
      /Invalid slug/,
    );
  });
});

describe("committed episode snapshot", () => {
  const snapshotPath = path.join(__dirname, "..", "..", "src", "data", "episodes.snapshot.json");
  const snapshot = episodeSnapshotSchema.parse(JSON.parse(readFileSync(snapshotPath, "utf8")));

  it("contains every fixture episode", () => {
    const snapshotGuids = new Set(snapshot.episodes.map((e) => e.sourceGuid));
    for (const episode of episodes) expect(snapshotGuids.has(episode.sourceGuid)).toBe(true);
  });

  it("uses each GUID's registered slug, with no duplicates", () => {
    for (const episode of snapshot.episodes) {
      expect(episode.slug).toBe(episodeSlugsByGuid[episode.sourceGuid]);
    }
    expect(new Set(snapshot.episodes.map((e) => e.slug)).size).toBe(snapshot.episodes.length);
  });

  it("contains no email addresses", () => {
    expect(JSON.stringify(snapshot)).not.toMatch(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  });
});
