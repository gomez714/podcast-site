import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { DEFAULT_PODCAST_RSS_URL } from "../src/lib/rss/config";

const FIXTURE_PATH = path.join(process.cwd(), "tests", "fixtures", "fusebox-feed.xml");
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const REDACTED_EMAIL = "redacted@example.com";

async function main() {
  const url = process.env.PODCAST_RSS_URL ?? DEFAULT_PODCAST_RSS_URL;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Feed request failed: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  const redactions = xml.match(EMAIL_PATTERN)?.length ?? 0;
  const redacted = xml.replace(EMAIL_PATTERN, REDACTED_EMAIL);

  await mkdir(path.dirname(FIXTURE_PATH), { recursive: true });
  await writeFile(FIXTURE_PATH, redacted, "utf8");

  console.log(`Saved ${path.relative(process.cwd(), FIXTURE_PATH)} from ${url}`);
  console.log(`Redacted ${redactions} email address(es).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
