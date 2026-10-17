import { mkdir } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const root = process.cwd();
const source = (file: string) => path.join(root, "assets", "hostPictures", file);

type Output = {
  file: string;
  source: string;
  /** Crop in source pixels, applied before resizing. */
  crop: { left: number; top: number; width: number; height: number };
  width: number;
};

const outputs: Output[] = [
  {
    // About page host section. 4:3, keeping the reflection in the glass beside him.
    file: "public/images/host/luis-reflection.jpg",
    source: "Luis_ArtisticReflection.jpg",
    crop: { left: 159, top: 0, width: 1281, height: 961 },
    width: 1200,
  },
  {
    // Homepage host teaser. 5:4 upper body, cropping out the branded socks and bottle.
    file: "public/images/host/luis-candid.jpg",
    source: "Luis_CandidSit.jpg",
    crop: { left: 0, top: 0, width: 1440, height: 1152 },
    width: 1200,
  },
];

async function main() {
  for (const output of outputs) {
    const target = path.join(root, output.file);
    await mkdir(path.dirname(target), { recursive: true });
    const info = await sharp(source(output.source))
      .rotate()
      .extract(output.crop)
      .resize({ width: output.width })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(target);
    console.log(
      `${output.file}  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)} KB`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
