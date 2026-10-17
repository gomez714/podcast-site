import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp, { type Sharp } from "sharp";

import { episodeEditorial } from "../src/content/episodes";
import { episodeThumbnailManifestSchema } from "../src/lib/episodes/schema";
import type { EpisodeThumbnail } from "../src/lib/episodes/types";

const root = process.cwd();
const OUTPUT_DIR = path.join(root, "public", "images", "episodes");
const MANIFEST_PATH = path.join(root, "src", "data", "episode-thumbnails.json");
const MAX_WIDTH = 1280;

/** Largest first. `sddefault`/`hqdefault` are 4:3 with the 16:9 frame letterboxed inside. */
const VARIANTS = ["maxresdefault", "sddefault", "hqdefault"];

async function downloadThumbnail(youtubeId: string): Promise<{ variant: string; image: Buffer }> {
  for (const variant of VARIANTS) {
    const response = await fetch(`https://i.ytimg.com/vi/${youtubeId}/${variant}.jpg`);
    if (response.ok) return { variant, image: Buffer.from(await response.arrayBuffer()) };
  }
  throw new Error(`No thumbnail found for YouTube video ${youtubeId}`);
}

async function to16x9(image: Buffer): Promise<Sharp> {
  const { width = 0, height = 0 } = await sharp(image).metadata();
  const frameHeight = Math.round((width * 9) / 16);
  const top = Math.max(0, Math.round((height - frameHeight) / 2));
  return sharp(image).extract({ left: 0, top, width, height: Math.min(frameHeight, height) });
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const manifest: Record<string, EpisodeThumbnail> = {};

  for (const { slug, youtubeId } of episodeEditorial) {
    if (!youtubeId) continue;

    const { variant, image } = await downloadThumbnail(youtubeId);
    const frame = await (await to16x9(image)).toBuffer();
    const { width: frameWidth = MAX_WIDTH } = await sharp(frame).metadata();
    const width = Math.min(MAX_WIDTH, frameWidth);
    const height = Math.round((width * 9) / 16);
    const file = `${slug}.jpg`;

    await sharp(frame)
      .resize(width, height, { fit: "cover" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(OUTPUT_DIR, file));
    const blur = await sharp(frame).resize(16, 9).jpeg({ quality: 60 }).toBuffer();

    manifest[slug] = {
      youtubeId,
      src: `/images/episodes/${file}`,
      width,
      height,
      blurDataURL: `data:image/jpeg;base64,${blur.toString("base64")}`,
    };
    console.log(`${file}  ${width}×${height}  from ${variant}`);
  }

  for (const file of await readdir(OUTPUT_DIR)) {
    if (!Object.values(manifest).some((entry) => entry.src.endsWith(`/${file}`))) {
      await rm(path.join(OUTPUT_DIR, file));
      console.log(`removed stale ${file}`);
    }
  }

  episodeThumbnailManifestSchema.parse(manifest);
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Wrote ${Object.keys(manifest).length} thumbnails`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
