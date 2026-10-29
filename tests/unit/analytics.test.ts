import { describe, expect, it } from "vitest";

import { ANALYTICS_EVENTS, cleanTag, readTrackedClick, trackClicks } from "@/lib/analytics";

describe("trackClicks / readTrackedClick", () => {
  it("round-trips an event and its properties through data attributes", () => {
    const attributes = trackClicks(ANALYTICS_EVENTS.platformClick, {
      platform: "Spotify",
      placement: "Footer",
    });
    expect(attributes).toEqual({
      "data-track": "Platform click",
      "data-track-platform": "Spotify",
      "data-track-placement": "Footer",
    });

    // What the browser's dataset exposes for those attributes.
    const dataset = { track: "Platform click", trackPlatform: "Spotify", trackPlacement: "Footer" };
    expect(readTrackedClick(dataset)).toEqual({
      event: "Platform click",
      properties: { platform: "Spotify", placement: "Footer" },
    });
  });

  it("ignores elements that aren't marked, and unrelated data attributes", () => {
    expect(readTrackedClick({ slot: "x" })).toBeUndefined();
    expect(readTrackedClick({ track: "Play pressed", episode: "x" })).toEqual({
      event: "Play pressed",
      properties: {},
    });
  });
});

describe("cleanTag", () => {
  it("keeps simple tags and drops anything else", () => {
    expect(cleanTag("instagram_show")).toBe("instagram_show");
    expect(cleanTag(" Instagram-Personal ")).toBe("instagram-personal");
    expect(cleanTag("<script>alert(1)</script>")).toBe("scriptalert1script");
    expect(cleanTag("a".repeat(60))).toHaveLength(40);
    expect(cleanTag("!!!")).toBeUndefined();
    expect(cleanTag(null)).toBeUndefined();
  });
});

describe("events stay within the included plan", () => {
  it("never uses more than two properties per event", () => {
    const attributes = trackClicks(ANALYTICS_EVENTS.platformClick, {
      platform: "a",
      placement: "b",
    });
    expect(Object.keys(attributes).filter((key) => key !== "data-track")).toHaveLength(2);
  });
});
