import Image from "next/image";
import Link from "next/link";

import type { EpisodeView } from "@/lib/episodes/types";
import { formatDuration, formatEpisodeDate } from "@/lib/format";

import fallbackArt from "../../../public/images/brand/episode-fallback.jpg";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * 16:9 episode card (spec §3.3, §5.2). The title link stretches over the whole card, so the card
 * has exactly one link. Shows the video's YouTube thumbnail, or the branded fallback when the
 * episode is audio-only.
 */
export function EpisodeCard({
  episode,
  sizes = "(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw",
  eager = false,
}: {
  episode: EpisodeView;
  sizes?: string;
  /** For cards on the first screen: load the image right away (it can be the page's LCP). */
  eager?: boolean;
}) {
  const image = episode.artwork.kind === "youtube" ? episode.artwork : fallbackArt;

  return (
    <article className="group relative flex w-full flex-col overflow-hidden rounded-[9px] border border-line-light bg-white transition-[border-color,box-shadow] hover:border-ice hover:shadow-[0_10px_30px_-18px_rgb(29_51_96/0.45)] has-focus-visible:outline-[3px] has-focus-visible:outline-offset-4 has-focus-visible:outline-(--focus) has-focus-visible:outline-solid">
      <div className="relative aspect-video overflow-hidden bg-navy">
        <Image
          src={image.src}
          alt=""
          fill
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          placeholder="blur"
          blurDataURL={image.blurDataURL}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {episode.episodeNumber && (
            <span className="rounded-sm bg-pale px-2 py-1 font-display text-sm leading-none font-extrabold tracking-[0.06em] text-navy">
              EP {pad(episode.episodeNumber)}
            </span>
          )}
          {episode.explicit && (
            <span className="rounded-sm bg-navy px-2 py-1 font-display text-sm leading-none font-extrabold tracking-[0.06em] text-white">
              Explicit
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-[18px] md:p-[22px]">
        <p className="text-[11px] font-extrabold tracking-[0.12em] text-slate uppercase">
          {episode.guestName}
        </p>
        <h3 className="text-base leading-snug font-bold text-navy">
          <Link
            href={`/episodes/${episode.slug}`}
            className="group-hover:underline after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {episode.title}
          </Link>
        </h3>
        {/* Clamped on phones to keep the archive short; the full summary leads the episode page. */}
        <p className="line-clamp-3 text-sm leading-[1.7] text-slate md:line-clamp-none">
          {episode.summary}
        </p>
        {episode.contentNote && (
          <p className="border-l-2 border-ice pl-2.5 text-xs leading-relaxed text-slate">
            <span className="font-bold text-navy">Content note:</span> {episode.contentNote}
          </p>
        )}
        <p className="mt-auto pt-2 text-xs font-semibold text-slate">
          <time dateTime={episode.publishedAt}>{formatEpisodeDate(episode.publishedAt)}</time>
          {episode.durationSeconds && (
            <>
              <span aria-hidden="true"> · </span>
              {formatDuration(episode.durationSeconds)}
            </>
          )}
          <span aria-hidden="true"> · </span>
          {episode.hasVideo ? "Listen & Watch" : "Audio only"}
        </p>
      </div>
    </article>
  );
}
