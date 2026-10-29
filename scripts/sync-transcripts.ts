import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { episodeSnapshotSchema } from "../src/lib/episodes/schema";
import { countWords, parseTranscriptHtml } from "../src/lib/transcripts/parse";
import { transcriptSnapshotSchema, type TranscriptSnapshot } from "../src/lib/transcripts/schema";

const EPISODES_PATH = path.join(process.cwd(), "src", "data", "episodes.snapshot.json");
const TRANSCRIPTS_PATH = path.join(process.cwd(), "src", "data", "transcripts.json");

/** Anything shorter is almost certainly an error page or an empty transcript, not an episode. */
const MIN_WORDS = 1000;

/**
 * Downloads each episode's Fusebox transcript (the `podcast:transcript` URL in the episode
 * snapshot), parses it into speaker turns and writes `src/data/transcripts.json`. Run it after
 * `npm run sync:episodes`. Writes nothing if any transcript fails, so the last good copy stays.
 */
async function main() {
  const { episodes } = episodeSnapshotSchema.parse(
    JSON.parse(await readFile(EPISODES_PATH, "utf8")),
  );

  const snapshot: TranscriptSnapshot = {};
  const problems: string[] = [];
  const summary: { slug: string; turns: number; words: number; speakers: string }[] = [];

  for (const episode of episodes) {
    if (!episode.transcriptUrl) {
      console.warn(`[skip] ${episode.slug}: the feed lists no transcript.`);
      continue;
    }

    const response = await fetch(episode.transcriptUrl);
    if (!response.ok) {
      problems.push(`${episode.slug}: transcript request failed (${response.status}).`);
      continue;
    }

    const turns = parseTranscriptHtml(await response.text());
    const words = countWords(turns);
    if (words < MIN_WORDS) {
      problems.push(`${episode.slug}: only ${words} words parsed; is the transcript missing?`);
      continue;
    }

    snapshot[episode.slug] = { sourceUrl: episode.transcriptUrl, turns };
    summary.push({
      slug: episode.slug,
      turns: turns.length,
      words,
      speakers: [...new Set(turns.map((turn) => turn.speaker ?? "(none)"))].join(", "),
    });
  }

  if (problems.length > 0) {
    throw new Error(`Transcripts not updated:\n- ${problems.join("\n- ")}`);
  }

  const valid = transcriptSnapshotSchema.parse(snapshot);
  await writeFile(TRANSCRIPTS_PATH, `${JSON.stringify(valid, null, 2)}\n`, "utf8");

  console.log(
    `Wrote ${summary.length} transcripts to ${path.relative(process.cwd(), TRANSCRIPTS_PATH)}`,
  );
  console.table(summary);
  console.log("Every speaker label above needs a display name in src/content/transcripts.ts.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
