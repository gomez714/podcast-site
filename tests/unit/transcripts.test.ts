import { describe, expect, it } from "vitest";

import { transcriptEdits } from "@/content/transcripts";
import { EpisodeInventoryError } from "@/lib/episodes/inventory";
import { getAllEpisodes } from "@/lib/episodes/repository";
import {
  buildTranscriptViews,
  getEpisodeTranscript,
  transcriptPreview,
} from "@/lib/episodes/transcripts";
import { countWords, parseTranscriptHtml } from "@/lib/transcripts/parse";

describe("parseTranscriptHtml", () => {
  it("reads Riverside label paragraphs and merges repeated labels for the same speaker", () => {
    const html =
      "<p>Luis (00:00.448)</p><p>Hey guys, welcome.</p>" +
      "<p>Alekson (00:10.406)</p><p>Thank you.</p><p>I'm from Brazil.</p>" +
      "<p>Luis (00:21.746)</p><p>Mm-hmm.</p><p>Luis (01:02:03.5)</p><p>And then?</p>";

    expect(parseTranscriptHtml(html)).toEqual([
      { speaker: "Luis", paragraphs: ["Hey guys, welcome."] },
      { speaker: "Alekson", paragraphs: ["Thank you.", "I'm from Brazil."] },
      { speaker: "Luis", paragraphs: ["Mm-hmm.", "And then?"] },
    ]);
  });

  it("reads 'Name: text' prefixes, keeps unlabelled paragraphs with the last speaker and drops time markers", () => {
    const html =
      "<p>Luis Gomez: [00:00:00] Welcome back.&nbsp;</p><p>Jurate Wolfe: I do so many things.</p>" +
      "<p>[00:01:00] More from Jurate.</p><p>Luis Gomez: Right.</p><p>Jurate Wolfe: Yes.</p>" +
      "<p>Luis Gomez: Okay.</p><p>Jurate Wolfe: Thanks.</p>";

    expect(parseTranscriptHtml(html)).toEqual([
      { speaker: "Luis Gomez", paragraphs: ["Welcome back."] },
      { speaker: "Jurate Wolfe", paragraphs: ["I do so many things.", "More from Jurate."] },
      { speaker: "Luis Gomez", paragraphs: ["Right."] },
      { speaker: "Jurate Wolfe", paragraphs: ["Yes."] },
      { speaker: "Luis Gomez", paragraphs: ["Okay."] },
      { speaker: "Jurate Wolfe", paragraphs: ["Thanks."] },
    ]);
  });

  it("doesn't treat a one-off colon as a speaker", () => {
    const turns = parseTranscriptHtml("<p>Here's the thing: it worked.</p><p>And again.</p>");
    expect(turns).toEqual([
      { speaker: null, paragraphs: ["Here's the thing: it worked.", "And again."] },
    ]);
  });

  it("returns plain text only: tags stripped, entities decoded and emails removed", () => {
    const turns = parseTranscriptHtml(
      '<p><span style="color: grey">[00:00:00]</span> Tom &amp; Jerry &#39;s show</p>' +
        "<p>Write to me at host@example.com</p><script>alert(1)</script>",
    );
    expect(turns).toEqual([
      { speaker: null, paragraphs: ["Tom & Jerry 's show", "Write to me at [email removed]"] },
    ]);
    expect(countWords(turns)).toBe(11);
  });
});

describe("buildTranscriptViews", () => {
  const snapshot = {
    "ep-x": {
      sourceUrl: "https://example.com/t",
      turns: [
        { speaker: "Luis", paragraphs: ["Welcome to the bottom left pain."] },
        { speaker: "guest", paragraphs: ["Thanks, Louis."] },
      ],
    },
  };

  it("applies display names, marks the host and applies corrections", () => {
    const views = buildTranscriptViews(snapshot, {
      "ep-x": {
        speakers: { Luis: "Luis", guest: "Guest" },
        corrections: [
          ["bottom left pain", "Bottom Left Pane"],
          ["Louis", "Luis"],
        ],
      },
    });
    expect(views.get("ep-x")).toEqual([
      { speaker: "Luis", isHost: true, paragraphs: ["Welcome to the Bottom Left Pane."] },
      { speaker: "Guest", isHost: false, paragraphs: ["Thanks, Luis."] },
    ]);
  });

  it("fails on an unmapped speaker, a stale correction, or edits without a transcript", () => {
    expect(() =>
      buildTranscriptViews(snapshot, {
        "ep-x": { speakers: { Luis: "Luis" }, corrections: [["not in the text", "x"]] },
        "ep-y": { speakers: {} },
      }),
    ).toThrow(EpisodeInventoryError);

    try {
      buildTranscriptViews(snapshot, {
        "ep-x": { speakers: { Luis: "Luis" }, corrections: [["not in the text", "x"]] },
        "ep-y": { speakers: {} },
      });
    } catch (error) {
      const message = (error as Error).message;
      expect(message).toContain('speaker "guest" with no display name');
      expect(message).toContain('correction "not in the text" no longer matches');
      expect(message).toContain('"ep-y" have no synced transcript');
    }
  });

  it("fails when a transcript has no edits entry", () => {
    expect(() => buildTranscriptViews(snapshot, {})).toThrow(/no entry in src\/content/);
  });
});

describe("transcriptPreview", () => {
  const turn = (speaker: string | null, ...paragraphs: string[]) => ({
    speaker,
    isHost: speaker === "Luis",
    paragraphs,
  });
  const words = (n: number) => Array.from({ length: n }, () => "word").join(" ");

  it("stops at the paragraph that reaches the word budget, even mid-turn", () => {
    const preview = transcriptPreview(
      [turn("Luis", words(5)), turn("Guest", words(4), words(4), words(4)), turn("Luis", words(3))],
      10,
    );
    expect(preview).toEqual([turn("Luis", words(5)), turn("Guest", words(4), words(4))]);
  });

  it("returns everything when the transcript is shorter than the budget", () => {
    const turns = [turn(null, words(3)), turn(null, words(3))];
    expect(transcriptPreview(turns, 100)).toEqual(turns);
  });

  it("keeps every real episode's preview close to 200 words", () => {
    for (const episode of getAllEpisodes()) {
      const preview = transcriptPreview(getEpisodeTranscript(episode.slug)!);
      const lastParagraph = preview.at(-1)!.paragraphs.at(-1)!.split(/\s+/).length;
      expect(countWords(preview), episode.slug).toBeGreaterThanOrEqual(200);
      expect(countWords(preview) - lastParagraph, episode.slug).toBeLessThan(200);
    }
  });
});

describe("synced transcripts", () => {
  it("cover every episode that has one, with names mapped and the host's fixes applied", () => {
    for (const episode of getAllEpisodes()) {
      const turns = getEpisodeTranscript(episode.slug);
      if (!episode.transcriptUrl) continue;
      expect(turns, episode.slug).toBeDefined();
      expect(transcriptEdits[episode.slug], episode.slug).toBeDefined();
    }

    const text = (slug: string) =>
      getEpisodeTranscript(slug)!
        .flatMap((turn) => turn.paragraphs)
        .join(" ");
    expect(text("ep-7-alekson")).not.toMatch(/\bAlexan\b/);
    expect(text("ep-1-luis-gomez")).toContain("the bottom left pane of the Johari window");
    expect(text("ep-8-yuko-sasaki")).toContain("Yuki here today, or Yuko, I'm sorry");
    expect(getEpisodeTranscript("ep-8-yuko-sasaki")!.map((turn) => turn.speaker)).toContain("Yuko");
  });
});
