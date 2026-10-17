# The Bottom Left Pane — website

The official website for **The Bottom Left Pane**, an interview podcast about the parts of people's lives that aren't always visible to others.

**Start here:** the full product, design and engineering specification is [`docs/THE_BOTTOM_LEFT_PANE_WEBSITE_SPEC.md`](docs/THE_BOTTOM_LEFT_PANE_WEBSITE_SPEC.md). It defines the approved design, the delivery phases and their acceptance criteria. Section 11 tracks what's been done.

## Stack

Next.js (App Router) · TypeScript (strict) · Tailwind CSS 4 · shadcn/ui (Base UI) · Zod · Vitest · Prettier. Podcast audio and the RSS feed are hosted by Fusebox; the site will deploy to Vercel.

## Getting started

Requires Node.js 24 and npm.

```bash
npm install
cp .env.example .env.local   # optional; defaults match production values
npm run dev                  # http://localhost:3000
```

## Scripts

| Command                     | What it does                                                                   |
| --------------------------- | ------------------------------------------------------------------------------ |
| `npm run dev`               | Start the development server.                                                  |
| `npm run build`             | Production build.                                                              |
| `npm run lint`              | ESLint.                                                                        |
| `npm run typecheck`         | TypeScript, no emit.                                                           |
| `npm run format`            | Format with Prettier (`format:check` to verify only).                          |
| `npm test`                  | Unit tests (Vitest).                                                           |
| `npm run sync:episodes`     | Fetch the live RSS feed and rewrite `src/data/episodes.snapshot.json`.         |
| `npm run fixture:refresh`   | Re-download the feed into `tests/fixtures/fusebox-feed.xml`, redacting emails. |
| `npm run assets:brand`      | Regenerate web images from the originals in `assets/brand/`.                   |
| `npm run assets:hero`       | Rebuild the homepage hero layers from `assets/brand/source/CoverArt.psd`.      |
| `npm run assets:thumbnails` | Download the YouTube thumbnail for each episode with a `youtubeId`.            |

## Project layout

```text
assets/brand/      Original brand artwork (not served directly)
docs/              Specification
public/images/     Generated, web-optimized images
scripts/           Feed sync, fixture refresh and asset build scripts
src/app/           Routes, root layout, metadata images and error pages
src/components/    home/ (hero, homepage sections), episodes/, media/ (audio player),
                   layout/ (header, footer, sections) and ui/ (shadcn primitives)
src/content/       Hand-written data: permanent episode slugs, episode editorial, featured picks
src/data/          Generated episode snapshot and thumbnail manifest
src/lib/           Episode schema/normalization, RSS parsing, player state and seeking, site config
src/proxy.ts       Returns a real 404 for unknown /episodes/<slug> URLs before the page streams
tests/             Unit tests and the RSS fixture
```

## Episode data

Episodes come from the Fusebox RSS feed, are validated with Zod and stored as a committed snapshot, so the site never depends on the feed being up at request time. Each episode's public URL slug is assigned by hand in `src/content/episode-slugs.ts`, keyed by RSS GUID; a new episode without a slug fails the sync rather than receiving a generated one. Slugs are permanent once published.

Everything written by hand lives in `src/content/episodes.ts`: guest name, card summary, topics, the confirmed YouTube video ID, optional checked `guestLinks` and curated `relatedSlugs`, and a `draft`/`reviewed` status. The feed sync never touches it. Pages read episodes only through `src/lib/episodes/repository.ts` (`getAllEpisodes`, `getEpisodeBySlug`, `getFeaturedEpisodes`, `getRelatedEpisodes`), which joins the snapshot, the editorial entries and the thumbnails, and fails the build if any of them disagree.

Episode pages take their longer description, takeaways and chapters from the feed's show notes (`src/lib/episodes/show-notes.ts`). Guest contact lines and the show's social footer are dropped; chapters seek the audio only.

Adding a new episode: run `npm run sync:episodes`, add its slug to `episode-slugs.ts` (the sync fails until you do), add an entry to `episodes.ts`, and if it has a filmed video, set `youtubeId` and run `npm run assets:thumbnails`. Then review the entry and set `reviewStatus: "reviewed"`.

## Brand assets

Originals in `assets/brand/` were copied from the show's brand kit:

| File                 | Original                                   |
| -------------------- | ------------------------------------------ |
| `cover-art.png`      | `CoverArt/CoverArt PNG 3000px.png`         |
| `header-image.png`   | `Header Image/Header Image PNG.png`        |
| `wordmark-color.svg` | `Delivery/LogoFiles/Artboard 1 copy.svg`   |
| `wordmark-white.svg` | `Delivery/LogoFiles/Artboard 1 copy 3.svg` |
| `icon-color.svg`     | `Delivery/LogoFiles/Artboard 1 copy 4.svg` |
| `icon-white.svg`     | `Delivery/LogoFiles/Artboard 1 copy 6.svg` |
| `source/*.psd`       | `Source Files/Source Files/*.psd`          |

`npm run assets:brand` produces the square cover art, the 16:9 audio-only episode fallback, the default Open Graph image and the favicons.

### Homepage hero

The hero is the cover art itself, split into layers so its door can open. `npm run assets:hero` reads the layered `CoverArt.psd`, recomposites it (and checks the result against Photoshop's own flattened image), then writes three transparent layers to `public/images/hero/`:

- `scene.png`: window, landscape and floor, with the doorway filled in as a closed door
- `light.png`: the lit doorway, its glow, the light on the floor and the figure's reflection
- `figure.png`: the figure, which stands in front of the door

The door panel and lock are drawn as SVG from the PSD's vector paths (`src/components/home/hero-geometry.json`) and animate from closed to open. The title block is left out because the hero copy is real text beside the art on desktop and below it on tablet and mobile. Run the script again if the PSD changes.
