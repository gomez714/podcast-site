"use client";

import { ArrowUp, LoaderCircle, Pause, Play } from "lucide-react";
import { useEffect, useState, type RefObject } from "react";

import { Container } from "@/components/layout/Container";
import { formatClock } from "@/lib/media/format-time";
import { shouldShowMiniPlayer, type PlaybackSnapshot } from "@/lib/media/player-state";

type MiniPlayerProps = {
  title: string;
  playback: PlaybackSnapshot;
  started: boolean;
  mode: "listen" | "watch";
  /** The main player, watched for visibility and returned to by "Back to player". */
  playerRef: RefObject<HTMLElement | null>;
  onToggle: () => void;
};

/**
 * Docked play/pause bar for the episode page (approved change, spec §7.2). It is `sticky` at the end
 * of the episode content, so it rides the bottom of the screen while scrolling and comes to rest
 * above the footer instead of covering it. It never persists across pages.
 */
export function MiniPlayer({
  title,
  playback,
  started,
  mode,
  playerRef,
  onToggle,
}: MiniPlayerProps) {
  const [playerVisible, setPlayerVisible] = useState(true);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const observer = new IntersectionObserver(([entry]) => setPlayerVisible(entry.isIntersecting), {
      threshold: 0.5,
    });
    observer.observe(player);
    return () => observer.disconnect();
  }, [playerRef]);

  if (!shouldShowMiniPlayer({ started, playerVisible, mode })) return null;

  const { status, buffering, currentTime, duration } = playback;
  const active = status === "playing" || status === "loading";
  const busy = status === "loading" || buffering;
  const progress = duration ? Math.min(100, (currentTime / duration) * 100) : 0;

  const backToPlayer = () => {
    const player = playerRef.current;
    if (!player) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    player.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    player.querySelector<HTMLButtonElement>("button.audio-play")?.focus({ preventScroll: true });
  };

  return (
    <section
      aria-label={`Now playing: ${title}`}
      className="audio-player-dark sticky bottom-0 z-20 border-t border-line-dark surface-dark pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_30px_-18px_rgb(0_0_0/0.6)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
    >
      <div aria-hidden="true" className="h-0.5 bg-(--track-base)">
        <div className="h-full bg-(--track-played)" style={{ width: `${progress}%` }} />
      </div>
      <Container className="flex items-center gap-3 py-2">
        <button
          type="button"
          aria-label={active ? "Pause" : "Play"}
          aria-busy={busy || undefined}
          onClick={onToggle}
          className="audio-play relative grid size-11 shrink-0 place-items-center rounded-full"
        >
          {active ? (
            <Pause aria-hidden="true" className="size-5" fill="currentColor" strokeWidth={0} />
          ) : (
            <Play
              aria-hidden="true"
              className="ml-0.5 size-5"
              fill="currentColor"
              strokeWidth={0}
            />
          )}
          {busy && (
            <LoaderCircle
              aria-hidden="true"
              className="absolute -inset-1 size-13 animate-spin text-(--track-played) [animation-duration:1.1s]"
              strokeWidth={1.5}
            />
          )}
        </button>

        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-bold">{title}</p>
          <p className="mt-0.5 text-xs font-semibold text-(--player-muted) tabular-nums">
            {formatClock(currentTime)} / {formatClock(duration)}
          </p>
        </div>

        <button
          type="button"
          aria-label="Back to player"
          onClick={backToPlayer}
          className="audio-chip inline-flex shrink-0 items-center gap-1.5"
        >
          <ArrowUp aria-hidden="true" className="size-4" />
          <span className="sm:hidden">Player</span>
          <span className="hidden sm:inline">Back to player</span>
        </button>
      </Container>
    </section>
  );
}
