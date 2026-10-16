import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

import sharp, { type Sharp } from "sharp";

const root = process.cwd();
const source = (file: string) => path.join(root, "assets", "brand", file);
const NAVY = "#1d3360";
const WHITE = "#ffffff";

/** Places the wide header artwork (already on solid navy) onto a navy canvas so nothing is cropped. */
async function onNavyCanvas(width: number, height: number): Promise<Sharp> {
  const artwork = await sharp(source("header-image.png"))
    .resize({ width, height, fit: "inside" })
    .toBuffer();
  return sharp({ create: { width, height, channels: 3, background: NAVY } }).composite([
    { input: artwork, gravity: "center" },
  ]);
}

async function iconOnWhite(size: number): Promise<Sharp> {
  // The source SVG already includes a margin around the mark.
  const padding = Math.round(size * 0.02);
  const icon = await sharp(source("icon-color.svg"), { density: 600 })
    .resize({
      width: size - padding * 2,
      height: size - padding * 2,
      fit: "contain",
      background: WHITE,
    })
    .flatten({ background: WHITE })
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 3, background: WHITE } }).composite(
    [{ input: icon, gravity: "center" }],
  );
}

type Output = { file: string; build: () => Promise<Sharp> };

const outputs: Output[] = [
  {
    // Square artwork for the audio player, About section and podcast-style cards.
    file: "public/images/brand/cover-art.jpg",
    build: async () =>
      sharp(source("cover-art.png")).resize(1400, 1400).jpeg({ quality: 84, mozjpeg: true }),
  },
  {
    // 16:9 card/hero fallback for audio-only episodes (spec §3.5).
    file: "public/images/brand/episode-fallback.jpg",
    build: async () => (await onNavyCanvas(1920, 1080)).jpeg({ quality: 84, mozjpeg: true }),
  },
  {
    // Default social share image; picked up by the opengraph-image file convention.
    file: "src/app/opengraph-image.jpg",
    build: async () => (await onNavyCanvas(1200, 630)).jpeg({ quality: 86, mozjpeg: true }),
  },
  { file: "src/app/icon.png", build: async () => (await iconOnWhite(512)).png() },
  { file: "src/app/apple-icon.png", build: async () => (await iconOnWhite(180)).png() },
];

async function main() {
  for (const output of outputs) {
    const target = path.join(root, output.file);
    await mkdir(path.dirname(target), { recursive: true });
    const info = await (await output.build()).toFile(target);
    console.log(
      `${output.file}  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)} KB`,
    );
  }

  // The create-next-app favicon would otherwise take precedence over icon.png in some browsers.
  await rm(path.join(root, "src/app/favicon.ico"), { force: true });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
