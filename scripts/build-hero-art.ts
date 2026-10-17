/**
 * Splits the layered cover art (assets/brand/source/CoverArt.psd) into the stacked layers used by
 * the homepage hero (spec §4.3): the static scene, the light that fades in behind the door, and
 * the figure standing in front of it. The door panel itself is drawn as SVG from the PSD's vector
 * paths so it can open, and its geometry is written to `hero-geometry.json`.
 *
 * Run with `npm run assets:hero` whenever the PSD changes.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

import { initializeCanvas, readPsd, type Layer, type Psd } from "ag-psd";
import sharp from "sharp";

const root = process.cwd();
const PSD_PATH = path.join(root, "assets/brand/source/CoverArt.psd");
const OUT_DIR = path.join(root, "public/images/hero");
const GEOMETRY_PATH = path.join(root, "src/components/home/hero-geometry.json");

/** Crop around the illustration (PSD pixels); the navy fill and title block are left out. */
const CROP = { left: 80, top: 100, width: 2830, height: 2840 };
const OUTPUT_WIDTH = 1600;
/** Max mean per-channel difference (0–255) between our recomposite and Photoshop's own. */
const MAX_MEAN_DIFF = 2;

type Pixels = { width: number; height: number; data: Float32Array };
type Path = string;

// ag-psd only needs ImageData-shaped objects when reading pixel data; no canvas is involved.
initializeCanvas(
  () => {
    throw new Error("Canvas is not available in this script");
  },
  (width, height) =>
    ({ width, height, data: new Uint8ClampedArray(width * height * 4) }) as ImageData,
);

function blank(width: number, height: number): Pixels {
  return { width, height, data: new Float32Array(width * height * 4) };
}

/** Straight-alpha RGBA layer pixels in 0–1, placed on a full-document canvas. */
function layerPixels(layer: Layer, psd: Psd, recolor?: [number, number, number]): Pixels {
  const out = blank(psd.width, psd.height);
  const image = layer.imageData;
  if (!image) return out;
  const opacity = (layer.opacity ?? 1) * (layer.fillOpacity ?? 1);
  const mask = layer.mask && !layer.mask.disabled ? layer.mask : undefined;
  for (let y = 0; y < image.height; y++) {
    const docY = (layer.top ?? 0) + y;
    if (docY < 0 || docY >= psd.height) continue;
    for (let x = 0; x < image.width; x++) {
      const docX = (layer.left ?? 0) + x;
      if (docX < 0 || docX >= psd.width) continue;
      const src = (y * image.width + x) * 4;
      let alpha = (image.data[src + 3] / 255) * opacity;
      if (mask) alpha *= maskValue(mask, docX, docY);
      if (alpha <= 0) continue;
      const dst = (docY * psd.width + docX) * 4;
      out.data[dst] = (recolor?.[0] ?? image.data[src]) / 255;
      out.data[dst + 1] = (recolor?.[1] ?? image.data[src + 1]) / 255;
      out.data[dst + 2] = (recolor?.[2] ?? image.data[src + 2]) / 255;
      out.data[dst + 3] = alpha;
    }
  }
  return out;
}

function maskValue(mask: NonNullable<Layer["mask"]>, x: number, y: number): number {
  const fallback = (mask.defaultColor ?? 255) / 255;
  const image = mask.imageData;
  if (!image) return fallback;
  const mx = x - (mask.left ?? 0);
  const my = y - (mask.top ?? 0);
  if (mx < 0 || my < 0 || mx >= image.width || my >= image.height) return fallback;
  return image.data[(my * image.width + mx) * 4] / 255;
}

/** Porter-Duff "over" (or "atop" when `clipToDestination`, i.e. a Photoshop clipping mask). */
function composite(dst: Pixels, src: Pixels, clipToDestination = false) {
  const d = dst.data;
  const s = src.data;
  for (let i = 0; i < d.length; i += 4) {
    const sa = s[i + 3];
    if (sa <= 0) continue;
    const da = d[i + 3];
    if (clipToDestination) {
      if (da <= 0) continue;
      for (let c = 0; c < 3; c++) d[i + c] = s[i + c] * sa + d[i + c] * (1 - sa);
      continue;
    }
    const outA = sa + da * (1 - sa);
    for (let c = 0; c < 3; c++) d[i + c] = (s[i + c] * sa + d[i + c] * da * (1 - sa)) / outA;
    d[i + 3] = outA;
  }
}

function applyLevels(pixels: Pixels, adjustment: NonNullable<Layer["adjustment"]>) {
  if (adjustment.type !== "levels" || !adjustment.rgb) return;
  const { shadowInput, highlightInput, midtoneInput, shadowOutput, highlightOutput } =
    adjustment.rgb;
  const lut = new Float32Array(256);
  for (let v = 0; v < 256; v++) {
    const t = Math.min(1, Math.max(0, (v - shadowInput) / (highlightInput - shadowInput)));
    lut[v] =
      (shadowOutput + Math.pow(t, 1 / midtoneInput) * (highlightOutput - shadowOutput)) / 255;
  }
  const d = pixels.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] <= 0) continue;
    for (let c = 0; c < 3; c++) d[i + c] = lut[Math.round(d[i + c] * 255)];
  }
}

type RenderOptions = {
  include: (path: Path) => boolean;
  /** Layers that only provide the alpha a clipping group is clipped to, without being drawn. */
  clipOnly?: (path: Path) => boolean;
  recolor?: Record<Path, [number, number, number]>;
};

/** Composites the layers chosen by `include`, honouring clipping groups and adjustment layers. */
function render(psd: Psd, options: RenderOptions): Pixels {
  const canvas = blank(psd.width, psd.height);

  const renderList = (layers: Layer[], parent: Path) => {
    let i = 0;
    while (i < layers.length) {
      const base = layers[i];
      const basePath = parent ? `${parent}/${base.name}` : (base.name ?? "");
      const clipped: Layer[] = [];
      let j = i + 1;
      while (j < layers.length && layers[j].clipping) clipped.push(layers[j++]);
      i = j;

      if (base.hidden) continue;
      if (base.children) {
        renderList(base.children, basePath);
        continue;
      }

      const drawBase = options.include(basePath);
      const clipBase = drawBase || options.clipOnly?.(basePath);
      if (!clipBase) continue;

      const group = layerPixels(base, psd, options.recolor?.[basePath]);
      const drawn = drawBase ? group : blank(psd.width, psd.height);
      const clipAlpha = group;
      for (const layer of clipped) {
        const layerPath = `${parent}/${layer.name}`;
        if (layer.hidden || !options.include(layerPath)) continue;
        if (layer.adjustment) {
          applyLevels(drawn, layer.adjustment);
          continue;
        }
        const pixels = layerPixels(layer, psd);
        // Clip the layer to the base's alpha, then lay it onto the group.
        for (let k = 3; k < pixels.data.length; k += 4) pixels.data[k] *= clipAlpha.data[k];
        composite(drawn, pixels, drawBase);
      }
      composite(canvas, drawn);
    }
  };

  renderList(psd.children ?? [], "");
  return canvas;
}

/** Removes anything in `pixels` that sits underneath the opaque parts of `occluder`. */
function occlude(pixels: Pixels, occluder: Pixels) {
  for (let i = 3; i < pixels.data.length; i += 4) pixels.data[i] *= 1 - occluder.data[i];
}

function toRgbaBuffer(pixels: Pixels): Buffer {
  const out = Buffer.alloc(pixels.width * pixels.height * 4);
  for (let i = 0; i < pixels.data.length; i++) out[i] = Math.round(pixels.data[i] * 255);
  return out;
}

async function save(name: string, pixels: Pixels) {
  const file = path.join(OUT_DIR, name);
  const info = await sharp(toRgbaBuffer(pixels), {
    raw: { width: pixels.width, height: pixels.height, channels: 4 },
  })
    .extract(CROP)
    .resize({ width: OUTPUT_WIDTH })
    .png({ compressionLevel: 9 })
    .toFile(file);
  console.log(
    `${path.relative(root, file)}  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)} KB`,
  );
}

/** Compares our full recomposite with the PSD's flattened composite, outside the title block. */
function verify(psd: Psd, ours: Pixels, titleBottom: number) {
  const reference = psd.imageData;
  if (!reference) throw new Error("PSD has no composite image to verify against");
  let total = 0;
  let count = 0;
  for (let y = titleBottom; y < psd.height; y++) {
    for (let x = 0; x < psd.width; x++) {
      const i = (y * psd.width + x) * 4;
      for (let c = 0; c < 3; c++) {
        total += Math.abs(ours.data[i + c] * 255 - reference.data[i + c]);
        count++;
      }
    }
  }
  const mean = total / count;
  console.log(`Recomposite vs Photoshop composite: mean difference ${mean.toFixed(2)} / 255`);
  if (mean > MAX_MEAN_DIFF) throw new Error("Recomposite drifted from the PSD; check layer logic");
}

type Point = [number, number];

/** Looks a layer up by its full group path, e.g. "Main Design/Door/Door". */
function findLayer(psd: Psd, layerPath: Path): Layer | undefined {
  let layers = psd.children;
  let layer: Layer | undefined;
  for (const name of layerPath.split("/")) {
    layer = layers?.find((candidate) => candidate.name === name);
    layers = layer?.children;
  }
  return layer;
}

function vectorQuad(psd: Psd, name: string): Point[] {
  const layer = findLayer(psd, `Main Design/Door/${name}`);
  const knots = layer?.vectorMask?.paths[0]?.knots;
  if (!knots || knots.length !== 4) throw new Error(`Expected a 4-point vector path on "${name}"`);
  return knots.map((knot) => [knot.points[2] - CROP.left, knot.points[3] - CROP.top]);
}

function hex(layer: Layer | undefined): string {
  const fill = layer?.vectorFill;
  if (fill?.type !== "color" || !("r" in fill.color)) throw new Error("Expected a solid fill");
  const { r, g, b } = fill.color;
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

const round = (points: Point[]) => points.map(([x, y]) => [Math.round(x), Math.round(y)]);

/**
 * The PSD only contains the open door. The closed door fills the doorway, and its lock sits as far
 * from the hinge (the doorway's right edge) as the open lock does, measured in door widths.
 */
function doorGeometry(psd: Psd) {
  const doorway = vectorQuad(psd, "Door Area");
  const openDoor = vectorQuad(psd, "Door");
  const openLock = vectorQuad(psd, "Doorlock");

  const [openTopLeft, , , openBottomLeft] = openDoor;
  const [closedTopLeft, , , closedBottomLeft] = doorway;
  const hingeX = doorway[1][0];
  const lockCentre: Point = [
    (openLock[1][0] + openLock[3][0]) / 2,
    (openLock[0][1] + openLock[2][1]) / 2,
  ];
  const across = (lockCentre[0] - hingeX) / (openTopLeft[0] - hingeX);
  const down = (lockCentre[1] - openTopLeft[1]) / (openBottomLeft[1] - openTopLeft[1]);
  const closedCentre: Point = [
    hingeX + across * (closedTopLeft[0] - hingeX),
    closedTopLeft[1] + down * (closedBottomLeft[1] - closedTopLeft[1]),
  ];
  const widthScale = (closedTopLeft[0] - hingeX) / (openTopLeft[0] - hingeX);
  const closedLock = openLock.map(([x, y]): Point => [
    closedCentre[0] + (x - lockCentre[0]) * widthScale,
    closedCentre[1] + (y - lockCentre[1]),
  ]);

  return {
    viewBox: [0, 0, CROP.width, CROP.height],
    doorway: round(doorway),
    door: {
      closed: round(doorway),
      open: round(openDoor),
      fill: hex(findLayer(psd, "Main Design/Door/Door")),
    },
    lock: { closed: round(closedLock), open: round(openLock) },
  };
}

async function main() {
  const psd = readPsd(await readFile(PSD_PATH), { useImageData: true, skipThumbnail: true });
  const title = findLayer(psd, "Main Design/Title");
  const titleBottom = Math.max(...(title?.children ?? []).map((layer) => layer.bottom ?? 0));

  const inGroup = (group: string) => (p: Path) => p.startsWith(`Main Design/${group}/`);
  const isFloorLight = (p: Path) =>
    p === "Main Design/Reflection/Shape 5" || p.includes("depositphotos");
  const isDoorLight = (p: Path) =>
    p === "Main Design/Door/Door Area" || p === "Main Design/Door/Glow";
  const doorFill = hex(findLayer(psd, "Main Design/Door/Door"));
  const doorRgb = [1, 3, 5].map((i) => parseInt(doorFill.slice(i, i + 2), 16)) as [
    number,
    number,
    number,
  ];

  const everything = render(psd, { include: (p) => !p.startsWith("Main Design/Title/") });
  verify(psd, everything, titleBottom);

  // Everything that stays put. The doorway is filled with the door colour so it reads as a closed
  // door until the light behind it fades in.
  const scene = render(psd, {
    include: (p) =>
      (inGroup("Reflection")(p) && !isFloorLight(p)) ||
      inGroup("Window")(p) ||
      p === "Main Design/Door/Door Area",
    recolor: { "Main Design/Door/Door Area": doorRgb },
  });

  // Light from the doorway: the bright opening, its glow, the spill across the floor and the
  // figure's reflection. The floor spill sits under the window in the PSD, so the window hides
  // part of it.
  const floorLight = render(psd, {
    include: isFloorLight,
    clipOnly: (p) => p === "Main Design/Reflection/Shape 2",
  });
  occlude(floorLight, render(psd, { include: inGroup("Window") }));
  const light = render(psd, { include: isDoorLight });
  composite(floorLight, light);

  const figure = render(psd, { include: (p) => p === "Main Design/man" });

  await mkdir(OUT_DIR, { recursive: true });
  await save("scene.png", scene);
  await save("light.png", floorLight);
  await save("figure.png", figure);

  await mkdir(path.dirname(GEOMETRY_PATH), { recursive: true });
  await writeFile(GEOMETRY_PATH, `${JSON.stringify(doorGeometry(psd), null, 2)}\n`);
  console.log(path.relative(root, GEOMETRY_PATH));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
