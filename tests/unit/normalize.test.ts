import { describe, expect, it } from "vitest";

import {
  htmlToPlainText,
  parseDurationSeconds,
  parsePositiveInt,
  parsePublishedAt,
} from "@/lib/episodes/normalize";

describe("parseDurationSeconds", () => {
  it.each([
    ["1339", 1339],
    ["22:19", 1339],
    ["0:22:19", 1339],
    ["1:02:03", 3723],
    [" 60 ", 60],
  ])("parses %j as %i seconds", (input, expected) => {
    expect(parseDurationSeconds(input)).toBe(expected);
  });

  it.each([undefined, "", "0", "00:00", "abc", "12:75", "1.5", "-30"])(
    "returns undefined for %j",
    (input) => {
      expect(parseDurationSeconds(input)).toBeUndefined();
    },
  );
});

describe("parsePublishedAt", () => {
  it("converts RFC 2822 dates with offsets to UTC", () => {
    expect(parsePublishedAt("Tue, 02 Jan 2024 00:30:00 -0500")).toBe("2024-01-02T05:30:00.000Z");
  });

  it.each([undefined, "", "yesterday"])("returns undefined for %j", (input) => {
    expect(parsePublishedAt(input)).toBeUndefined();
  });
});

describe("parsePositiveInt", () => {
  it.each([
    ["3", 3],
    ["0", undefined],
    ["3a", undefined],
    ["", undefined],
    ["99999999999999999999", undefined],
  ])("parses %j as %j", (input, expected) => {
    expect(parsePositiveInt(input)).toBe(expected);
  });
});

describe("htmlToPlainText", () => {
  it("turns block elements and line breaks into newlines", () => {
    expect(
      htmlToPlainText("<div>One<br><br><strong>Two<br>- </strong>three</div><div>Four</div>"),
    ).toBe("One\n\nTwo\n- three\nFour");
  });

  it("decodes named and numeric entities", () => {
    expect(htmlToPlainText("Tom &amp; Jerry&#39;s &#x2014; caf&#233;&nbsp;time")).toBe(
      "Tom & Jerry's — café time",
    );
  });
});
