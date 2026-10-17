import type { EpisodeView } from "@/lib/episodes/types";

import { EpisodeCard } from "./EpisodeCard";

const GRID_SIZES = "(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw";

export function EpisodeGrid({ episodes }: { episodes: EpisodeView[] }) {
  return (
    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {episodes.map((episode, index) => (
        <li key={episode.slug} className="flex">
          {/* The first row (up to 3 cards on desktop) is on the first screen. */}
          <EpisodeCard episode={episode} sizes={GRID_SIZES} eager={index < 3} />
        </li>
      ))}
    </ul>
  );
}
