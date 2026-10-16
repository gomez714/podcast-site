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

| Command                   | What it does                                                                   |
| ------------------------- | ------------------------------------------------------------------------------ |
| `npm run dev`             | Start the development server.                                                  |
| `npm run build`           | Production build.                                                              |
| `npm run lint`            | ESLint.                                                                        |
| `npm run typecheck`       | TypeScript, no emit.                                                           |
| `npm run format`          | Format with Prettier (`format:check` to verify only).                          |
| `npm test`                | Unit tests (Vitest).                                                           |
| `npm run sync:episodes`   | Fetch the live RSS feed and rewrite `src/data/episodes.snapshot.json`.         |
| `npm run fixture:refresh` | Re-download the feed into `tests/fixtures/fusebox-feed.xml`, redacting emails. |
| `npm run assets:brand`    | Regenerate web images from the originals in `assets/brand/`.                   |

## Project layout

```text
assets/brand/      Original brand artwork (not served directly)
docs/              Specification
public/images/     Generated, web-optimized images
scripts/           Feed sync, fixture refresh and asset build scripts
src/app/           Routes, root layout, metadata images and error pages
src/components/    layout/ (header, footer, sections) and ui/ (shadcn primitives)
src/content/       Reviewed editorial data, e.g. permanent episode slugs
src/data/          Generated episode snapshot
src/lib/           Episode schema/normalization, RSS parsing, site config
tests/             Unit tests and the RSS fixture
```

## Episode data

Episodes come from the Fusebox RSS feed, are validated with Zod and stored as a committed snapshot, so the site never depends on the feed being up at request time. Each episode's public URL slug is assigned by hand in `src/content/episode-slugs.ts`, keyed by RSS GUID; a new episode without a slug fails the sync rather than receiving a generated one. Slugs are permanent once published.

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

`npm run assets:brand` produces the square cover art, the 16:9 audio-only episode fallback, the default Open Graph image and the favicons.
