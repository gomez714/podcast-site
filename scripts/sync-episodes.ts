import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { episodeSlugsByGuid } from "../src/content/episode-slugs";
import { buildEpisodeInventory } from "../src/lib/episodes/inventory";
import { episodeSnapshotSchema } from "../src/lib/episodes/schema";
import type { EpisodeSnapshot } from "../src/lib/episodes/types";
import { DEFAULT_PODCAST_RSS_URL } from "../src/lib/rss/config";
import { parseFeed } from "../src/lib/rss/parse-feed";

const SNAPSHOT_PATH = path.join(process.cwd(), "src", "data", "episodes.snapshot.json");
const FIXTURE_PATH = path.join(process.cwd(), "tests", "fixtures", "fusebox-feed.xml");

async function loadFeed(useFixture: boolean): Promise<{ xml: string; sourceUrl: string }> {
  if (useFixture) {
    return {
      xml: await readFile(FIXTURE_PATH, "utf8"),
      sourceUrl: "tests/fixtures/fusebox-feed.xml",
    };
  }

  const sourceUrl = process.env.PODCAST_RSS_URL ?? DEFAULT_PODCAST_RSS_URL;
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Feed request failed: ${response.status} ${response.statusText}`);
  }
  return { xml: await response.text(), sourceUrl };
}

async function main() {
  const useFixture = process.argv.includes("--fixture");
  const { xml, sourceUrl } = await loadFeed(useFixture);
  const { show, episodes, issues } = parseFeed(xml);

  for (const issue of issues) {
    const where = issue.sourceGuid ?? `item ${issue.itemIndex}`;
    console.warn(`[${issue.severity}] ${where} ${issue.field}: ${issue.message}`);
  }

  if (issues.some((issue) => issue.severity === "error")) {
    throw new Error(
      "Feed has errors; snapshot not updated. The last-known-good snapshot is unchanged.",
    );
  }

  const snapshot: EpisodeSnapshot = episodeSnapshotSchema.parse({
    sourceUrl,
    show,
    episodes: buildEpisodeInventory(episodes, episodeSlugsByGuid),
  });

  await mkdir(path.dirname(SNAPSHOT_PATH), { recursive: true });
  await writeFile(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

  console.log(
    `Wrote ${snapshot.episodes.length} episodes to ${path.relative(process.cwd(), SNAPSHOT_PATH)}`,
  );
  console.table(
    snapshot.episodes.map((episode) => ({
      ep: episode.episodeNumber,
      slug: episode.slug,
      publishedAt: episode.publishedAt,
      duration: episode.durationSeconds,
      explicit: episode.explicit,
    })),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
