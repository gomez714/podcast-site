import { XMLParser, XMLValidator } from "fast-xml-parser";

import {
  compareEpisodesNewestFirst,
  htmlToPlainText,
  parseDurationSeconds,
  parseExplicit,
  parsePositiveInt,
  parsePublishedAt,
  redactEmails,
} from "../episodes/normalize";
import { showSchema, sourceEpisodeSchema } from "../episodes/schema";
import type { FeedIssue, Show, SourceEpisode } from "../episodes/types";

export type ParsedFeed = {
  show: Show;
  /** Valid episodes, sorted newest first. */
  episodes: SourceEpisode[];
  issues: FeedIssue[];
};

type XmlRecord = Record<string, unknown>;

function isRecord(node: unknown): node is XmlRecord {
  return typeof node === "object" && node !== null;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  // Keep every value as a string; conversion happens explicitly below.
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true,
  isArray: (name) => name === "item" || name === "itunes:category",
});

function text(node: unknown): string | undefined {
  const value = isRecord(node) ? node["#text"] : node;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function attr(node: unknown, name: string): string | undefined {
  return isRecord(node) ? text(node[`@_${name}`]) : undefined;
}

function httpsUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value).protocol === "https:" ? value : undefined;
  } catch {
    return undefined;
  }
}

function parseShow(channel: XmlRecord): Show {
  const type = text(channel["itunes:type"]);
  return showSchema.parse({
    title: text(channel.title),
    link: httpsUrl(text(channel.link)),
    feedUrl: httpsUrl(attr(channel["atom:link"], "href")),
    language: text(channel.language),
    author: text(channel["itunes:author"]),
    artworkUrl: httpsUrl(attr(channel["itunes:image"], "href")),
    explicit: parseExplicit(text(channel["itunes:explicit"])),
    type: type === "episodic" || type === "serial" ? type : undefined,
  });
}

function parseItem(
  item: XmlRecord,
  itemIndex: number,
  issues: FeedIssue[],
): SourceEpisode | undefined {
  const sourceGuid = text(item.guid);
  const report = (severity: FeedIssue["severity"], field: string, message: string) =>
    issues.push({ severity, itemIndex, sourceGuid, field, message });

  const title = text(item.title);
  const rawPubDate = text(item.pubDate);
  const publishedAt = parsePublishedAt(rawPubDate);
  const rawAudioUrl = attr(item.enclosure, "url");
  const audioUrl = httpsUrl(rawAudioUrl);

  if (!sourceGuid) report("error", "guid", "Missing GUID; item skipped.");
  if (!title) report("error", "title", "Missing title; item skipped.");
  if (!publishedAt)
    report("error", "pubDate", `Missing or invalid pubDate "${rawPubDate ?? ""}"; item skipped.`);
  if (!audioUrl)
    report(
      "error",
      "enclosure",
      `Missing or non-HTTPS enclosure URL "${rawAudioUrl ?? ""}"; item skipped.`,
    );
  if (!sourceGuid || !title || !publishedAt || !audioUrl) return undefined;

  const audioMimeType = attr(item.enclosure, "type");
  if (audioMimeType !== "audio/mpeg") {
    report("warning", "enclosure", `Unexpected enclosure type "${audioMimeType ?? ""}".`);
  }

  const rawDuration = text(item["itunes:duration"]);
  const durationSeconds = parseDurationSeconds(rawDuration);
  if (durationSeconds === undefined) {
    report("warning", "itunes:duration", `Missing or invalid duration "${rawDuration ?? ""}".`);
  }

  const rawEpisode = text(item["itunes:episode"]);
  const episodeNumber = parsePositiveInt(rawEpisode);
  if (episodeNumber === undefined) {
    report("warning", "itunes:episode", `Missing or invalid episode number "${rawEpisode ?? ""}".`);
  }

  // Fusebox's <description> is a tag-stripped copy without line breaks; <content:encoded> keeps the structure.
  const rawDescription = text(item["content:encoded"]) ?? text(item.description);
  if (!rawDescription) report("warning", "description", "Missing description.");
  // Show notes can contain guests' personal email addresses; drop them before anything is stored.
  const originalDescriptionHtml = rawDescription && redactEmails(rawDescription);

  const candidate = {
    sourceGuid,
    episodeNumber,
    title,
    publishedAt,
    durationSeconds,
    explicit: parseExplicit(text(item["itunes:explicit"])),
    audioUrl,
    audioMimeType,
    audioByteLength: parsePositiveInt(attr(item.enclosure, "length")),
    sourceArtworkUrl: httpsUrl(attr(item["itunes:image"], "href")),
    transcriptUrl: httpsUrl(attr(item["podcast:transcript"], "url")),
    descriptionText: originalDescriptionHtml ? htmlToPlainText(originalDescriptionHtml) : "",
    originalDescriptionHtml,
  };

  const result = sourceEpisodeSchema.safeParse(candidate);
  if (!result.success) {
    for (const problem of result.error.issues) {
      report("error", problem.path.join(".") || "item", `${problem.message}; item skipped.`);
    }
    return undefined;
  }
  return result.data;
}

export function parseFeed(xml: string): ParsedFeed {
  const validation = XMLValidator.validate(xml);
  if (validation !== true) {
    const { msg, line, col } = validation.err;
    throw new Error(`Feed is not well-formed XML (line ${line}, column ${col}): ${msg}`);
  }

  const channel = (parser.parse(xml) as { rss?: { channel?: XmlRecord } }).rss?.channel;
  if (!channel) throw new Error("Feed has no <rss><channel> element.");

  const issues: FeedIssue[] = [];
  const show = parseShow(channel);
  const items = Array.isArray(channel.item) ? (channel.item as XmlRecord[]) : [];

  const seenGuids = new Set<string>();
  const episodes: SourceEpisode[] = [];

  items.forEach((item, itemIndex) => {
    const episode = parseItem(item, itemIndex, issues);
    if (!episode) return;

    if (seenGuids.has(episode.sourceGuid)) {
      issues.push({
        severity: "error",
        itemIndex,
        sourceGuid: episode.sourceGuid,
        field: "guid",
        message: "Duplicate GUID; later item skipped.",
      });
      return;
    }
    seenGuids.add(episode.sourceGuid);
    episodes.push(episode);
  });

  episodes.sort(compareEpisodesNewestFirst);
  return { show, episodes, issues };
}
