import { describe, expect, it } from "vitest";

import { getAllEpisodes, getEpisodeBySlug } from "@/lib/episodes/repository";
import { parseShowNotes, parseTimestamp } from "@/lib/episodes/show-notes";

describe("parseTimestamp", () => {
  it("reads mm:ss and hh:mm:ss", () => {
    expect(parseTimestamp("03:05")).toBe(185);
    expect(parseTimestamp("1:02:03")).toBe(3723);
    expect(parseTimestamp("00:54:00")).toBe(3240);
  });
});

describe("parseShowNotes", () => {
  it("splits description, takeaways and chapters and drops the show footer", () => {
    const notes = parseShowNotes(
      [
        "A conversation about running.",
        "",
        "Key Takeaways",
        "- Rest matters.",
        "-Consistency wins.",
        "",
        "Chapters",
        "00:00 Introduction",
        "[00:03:00] Training",
        "",
        "You can follow Simon on Instagram @simon!",
        "------------------",
        "Website: https://bottomleftpane.com",
        "TikTok: https://www.tiktok.com/@bottomleftpane",
      ].join("\n"),
      600,
    );
    expect(notes).toEqual({
      paragraphs: ["A conversation about running."],
      takeaways: ["Rest matters.", "Consistency wins."],
      chapters: [
        { startSeconds: 0, title: "Introduction" },
        { startSeconds: 180, title: "Training" },
      ],
    });
  });

  it("never publishes contact lines, links or handles from the description", () => {
    const notes = parseShowNotes(
      "About the episode.\nReach her at https://example.com or @handle.\n\nSecond paragraph.",
    );
    expect(notes.paragraphs).toEqual(["About the episode.", "Second paragraph."]);
  });

  it("drops every chapter if any time is out of order or past the end", () => {
    const outOfOrder = "Intro.\n\nChapters\n05:00 Later\n01:00 Earlier";
    expect(parseShowNotes(outOfOrder, 600).chapters).toEqual([]);
    const pastEnd = "Intro.\n\nChapters\n00:00 Start\n12:00 Too late";
    expect(parseShowNotes(pastEnd, 600).chapters).toEqual([]);
  });

  it("handles notes with no takeaways or chapters", () => {
    expect(parseShowNotes("Just a description.\n\nInstagram: https://x.com/y")).toEqual({
      paragraphs: ["Just a description."],
      takeaways: [],
      chapters: [],
    });
  });
});

describe("show notes from the real feed", () => {
  it("gives every episode exactly one clean description paragraph", () => {
    for (const episode of getAllEpisodes()) {
      expect(episode.showNotes.paragraphs).toHaveLength(1);
      expect(episode.showNotes.paragraphs[0]).not.toMatch(/https?:|www\.|@\w|\[email/);
    }
  });

  it("finds chapters for every episode except the introduction", () => {
    const counts = Object.fromEntries(
      getAllEpisodes().map((episode) => [episode.episodeNumber, episode.showNotes.chapters.length]),
    );
    expect(counts).toEqual({ 1: 0, 2: 14, 3: 18, 4: 15, 5: 18, 6: 11, 7: 17, 8: 14 });
  });

  it("keeps takeaways only where the host wrote them", () => {
    const withTakeaways = getAllEpisodes()
      .filter((episode) => episode.showNotes.takeaways.length > 0)
      .map((episode) => episode.episodeNumber);
    expect(withTakeaways).toEqual([4, 3, 2]);
  });

  it("drops guest contact lines that follow the chapters", () => {
    const kate = getEpisodeBySlug("ep-4-kate-conwell")!;
    expect(JSON.stringify(kate.showNotes)).not.toMatch(/journeybeyondbetrayal\.com|@joun/);
    const razie = getEpisodeBySlug("ep-2-razie")!;
    expect(JSON.stringify(razie.showNotes)).not.toMatch(/email/i);
  });
});
