import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { parseFeed } from "@/lib/rss/parse-feed";

const fixtureXml = readFileSync(path.join(__dirname, "..", "fixtures", "fusebox-feed.xml"), "utf8");

type ItemFields = Partial<{
  guid: string | null;
  title: string | null;
  pubDate: string | null;
  enclosure: string | null;
  duration: string | null;
  episode: string | null;
  explicit: string;
  description: string;
  contentEncoded: string;
}>;

function item(fields: ItemFields = {}): string {
  const f = {
    guid: "guid-1",
    title: "Title",
    pubDate: "Tue, 02 Jan 2024 00:30:00 -0500",
    enclosure: '<enclosure url="https://example.com/1.mp3" type="audio/mpeg" length="100"/>',
    duration: "60",
    episode: "1",
    explicit: "false",
    ...fields,
  };
  return [
    "<item>",
    f.title !== null && `<title><![CDATA[${f.title}]]></title>`,
    f.guid !== null && `<guid isPermaLink="false">${f.guid}</guid>`,
    f.pubDate !== null && `<pubDate>${f.pubDate}</pubDate>`,
    f.enclosure !== null && f.enclosure,
    f.duration !== null && `<itunes:duration>${f.duration}</itunes:duration>`,
    f.episode !== null && `<itunes:episode>${f.episode}</itunes:episode>`,
    `<itunes:explicit>${f.explicit}</itunes:explicit>`,
    f.description !== undefined && `<description>${f.description}</description>`,
    f.contentEncoded !== undefined && `<content:encoded><![CDATA[${f.contentEncoded}]]></content:encoded>`,
    "</item>",
  ]
    .filter(Boolean)
    .join("\n");
}

function feed(...items: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Test Show</title>
    ${items.join("\n")}
  </channel>
</rss>`;
}

describe("parseFeed with the Fusebox fixture", () => {
  const { show, episodes, issues } = parseFeed(fixtureXml);

  it("parses all eight items without issues", () => {
    expect(issues).toEqual([]);
    expect(episodes).toHaveLength(8);
  });

  it("has eight unique GUIDs and valid Fusebox MP3 enclosures", () => {
    expect(new Set(episodes.map((e) => e.sourceGuid)).size).toBe(8);
    for (const episode of episodes) {
      expect(episode.audioUrl).toMatch(
        /^https:\/\/app\.fusebox\.fm\/data\/show\/4YWVnlrWo1\/episode\/\d+\/audio\.mp3$/,
      );
      expect(episode.audioMimeType).toBe("audio/mpeg");
      expect(episode.audioByteLength).toBeGreaterThan(0);
    }
  });

  it("sorts newest first even though the feed lists episode 3 before 2 with equal timestamps", () => {
    expect(episodes.map((e) => e.episodeNumber)).toEqual([8, 7, 6, 5, 4, 3, 2, 1]);

    const ep2 = episodes.find((e) => e.episodeNumber === 2);
    const ep3 = episodes.find((e) => e.episodeNumber === 3);
    expect(ep2?.publishedAt).toBe(ep3?.publishedAt);
  });

  it("produces the same order regardless of feed item order", () => {
    const items = fixtureXml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
    const reorderedXml = fixtureXml.replace(/<item>[\s\S]*<\/item>/, items.reverse().join("\n"));

    expect(items).toHaveLength(8);
    expect(parseFeed(reorderedXml).episodes.map((e) => e.sourceGuid)).toEqual(
      episodes.map((e) => e.sourceGuid),
    );
  });

  it("normalizes dates to UTC ISO strings and durations to integer seconds", () => {
    const ep1 = episodes.find((e) => e.episodeNumber === 1);
    expect(ep1?.publishedAt).toBe("2023-12-27T21:22:36.000Z");
    expect(ep1?.durationSeconds).toBe(1339);
    for (const episode of episodes) {
      expect(Number.isInteger(episode.durationSeconds)).toBe(true);
    }
  });

  it("flags only episode 3 as explicit", () => {
    expect(episodes.filter((e) => e.explicit).map((e) => e.episodeNumber)).toEqual([3]);
  });

  it("captures transcript and artwork URLs", () => {
    for (const episode of episodes) {
      expect(episode.transcriptUrl).toBe(
        `https://app.fusebox.fm/data/show/4YWVnlrWo1/episode/${episode.episodeNumber}/transcript`,
      );
      expect(episode.sourceArtworkUrl).toMatch(/^https:\/\/podcasts\.fusebox\.fm\//);
    }
  });

  it("derives structured plain text from content:encoded with no markup or emails", () => {
    const ep3 = episodes.find((e) => e.episodeNumber === 3);
    expect(ep3?.originalDescriptionHtml).toMatch(/^<div>/);
    expect(ep3?.descriptionText).toContain("personal growth.\n\nKey Takeaways\n- Ultra marathon");
    expect(ep3?.descriptionText).toContain("00:00 Introduction and Background");

    for (const episode of episodes) {
      expect(episode.descriptionText).not.toMatch(/<[a-z/][^>]*>/i);
      expect(episode.descriptionText).not.toMatch(/@[a-z0-9-]+\.[a-z]{2,}/i);
    }
  });

  it("reads show metadata without exposing the owner email", () => {
    expect(show).toEqual({
      title: "The Bottom Left Pane",
      link: "https://bottomleftpane.com",
      feedUrl: "https://app.fusebox.fm/data/show/4YWVnlrWo1/feed",
      language: "en-us",
      author: "Luis Gomez",
      artworkUrl: expect.stringMatching(/^https:\/\/podcasts\.fusebox\.fm\//),
      explicit: false,
      type: "episodic",
    });
    expect(JSON.stringify(show)).not.toContain("@");
  });
});

describe("parseFeed edge cases", () => {
  it("handles a feed with a single item", () => {
    expect(parseFeed(feed(item())).episodes).toHaveLength(1);
  });

  it("handles a feed with no items", () => {
    expect(parseFeed(feed())).toMatchObject({ episodes: [], issues: [] });
  });

  it("rejects malformed XML with a clear error", () => {
    expect(() => parseFeed("<rss><channel><item></channel></rss>")).toThrow(/not well-formed XML/);
  });

  it("rejects XML that is not an RSS feed", () => {
    expect(() => parseFeed("<html><body/></html>")).toThrow(/no <rss><channel>/);
  });

  it.each([
    ["guid", { guid: null }],
    ["title", { title: null }],
    ["pubDate", { pubDate: null }],
    ["pubDate", { pubDate: "not a date" }],
    ["enclosure", { enclosure: null }],
    ["enclosure", { enclosure: '<enclosure url="http://example.com/1.mp3" type="audio/mpeg"/>' }],
  ] as const)("skips an item with missing/invalid %s and reports an error", (field, fields) => {
    const { episodes, issues } = parseFeed(feed(item(fields), item({ guid: "guid-2" })));
    expect(episodes.map((e) => e.sourceGuid)).toEqual(["guid-2"]);
    expect(issues).toContainEqual(expect.objectContaining({ severity: "error", field, itemIndex: 0 }));
  });

  it.each([
    ["missing", null],
    ["empty", ""],
    ["garbage", "about an hour"],
    ["zero", "0"],
  ])("keeps an item with a %s duration as unknown and warns", (_label, duration) => {
    const { episodes, issues } = parseFeed(feed(item({ duration })));
    expect(episodes[0].durationSeconds).toBeUndefined();
    expect(issues).toContainEqual(
      expect.objectContaining({ severity: "warning", field: "itunes:duration" }),
    );
  });

  it("accepts clock-format durations", () => {
    expect(parseFeed(feed(item({ duration: "1:02:03" }))).episodes[0].durationSeconds).toBe(3723);
  });

  it("keeps an item with no episode number and warns", () => {
    const { episodes, issues } = parseFeed(feed(item({ episode: null })));
    expect(episodes[0].episodeNumber).toBeUndefined();
    expect(issues).toContainEqual(expect.objectContaining({ field: "itunes:episode" }));
  });

  it("skips later items with a duplicate GUID", () => {
    const { episodes, issues } = parseFeed(
      feed(item({ title: "First" }), item({ title: "Second" })),
    );
    expect(episodes.map((e) => e.title)).toEqual(["First"]);
    expect(issues).toContainEqual(expect.objectContaining({ field: "guid", itemIndex: 1 }));
  });

  it("breaks equal-timestamp ties by episode number, then GUID", () => {
    const { episodes } = parseFeed(
      feed(
        item({ guid: "b", episode: "2" }),
        item({ guid: "c", episode: null }),
        item({ guid: "a", episode: null }),
        item({ guid: "d", episode: "3" }),
      ),
    );
    expect(episodes.map((e) => e.sourceGuid)).toEqual(["d", "b", "a", "c"]);
  });

  it("falls back to an escaped <description> when content:encoded is absent", () => {
    const { episodes } = parseFeed(
      feed(item({ description: "&lt;p&gt;Fish &amp;amp; chips&lt;/p&gt;&lt;p&gt;Second&lt;/p&gt;" })),
    );
    expect(episodes[0].descriptionText).toBe("Fish & chips\nSecond");
  });

  it("never carries scripts or emails into plain text", () => {
    const { episodes } = parseFeed(
      feed(
        item({
          contentEncoded:
            '<div>Hi<script>alert("x")</script></div><div>Reach me at someone@example.com&nbsp;today</div>',
        }),
      ),
    );
    expect(episodes[0].descriptionText).toBe("Hi\nReach me at [email removed] today");
  });

  it("treats explicit values case-insensitively", () => {
    expect(parseFeed(feed(item({ explicit: "Yes" }))).episodes[0].explicit).toBe(true);
    expect(parseFeed(feed(item({ explicit: "clean" }))).episodes[0].explicit).toBe(false);
  });
});
