"use client";

import { cn } from "cn";
import { LoaderCircle, Pause, Play, RotateCcw, RotateCw } from "lucide-react";
import type { ReactNode } from "react";

import type { PlayerStatus } from "@/lib/media/player-state";

export const SKIP_BACK_SECONDS = 15;
export const SKIP_FORWARD_SECONDS = 30;

type PlaybackControlsProps = {
  status: PlayerStatus;
  buffering: boolean;
  onToggle: () => void;
  onSkip: (seconds: number) => void;
};

/** Skip back 15 s, play/pause, skip forward 30 s (spec §7.2). */
export function PlaybackControls({ status, buffering, onToggle, onSkip }: PlaybackControlsProps) {
  const active = status === "playing" || status === "loading";
  const busy = status === "loading" || buffering;
  const label = active ? "Pause" : status === "ended" ? "Play again" : "Play";

  return (
    <div className="flex items-center gap-3">
      <SkipButton
        label={`Back ${SKIP_BACK_SECONDS} seconds`}
        onClick={() => onSkip(-SKIP_BACK_SECONDS)}
      >
        <RotateCcw aria-hidden="true" className="size-7" strokeWidth={1.75} />
        <span className="absolute text-[10px] font-extrabold">{SKIP_BACK_SECONDS}</span>
      </SkipButton>

      <button
        type="button"
        aria-label={label}
        aria-busy={busy || undefined}
        onClick={onToggle}
        className="audio-play relative grid size-16 shrink-0 place-items-center rounded-full transition-transform active:scale-95 motion-reduce:transition-none"
      >
        {active ? (
          <Pause aria-hidden="true" className="size-7" fill="currentColor" strokeWidth={0} />
        ) : (
          <Play aria-hidden="true" className="ml-1 size-7" fill="currentColor" strokeWidth={0} />
        )}
        {busy && (
          <LoaderCircle
            aria-hidden="true"
            className="absolute -inset-1 size-[4.5rem] animate-spin text-(--track-played) [animation-duration:1.1s]"
            strokeWidth={1.5}
          />
        )}
      </button>

      <SkipButton
        label={`Forward ${SKIP_FORWARD_SECONDS} seconds`}
        onClick={() => onSkip(SKIP_FORWARD_SECONDS)}
      >
        <RotateCw aria-hidden="true" className="size-7" strokeWidth={1.75} />
        <span className="absolute text-[10px] font-extrabold">{SKIP_FORWARD_SECONDS}</span>
      </SkipButton>
    </div>
  );
}

function SkipButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "relative grid size-12 place-items-center rounded-full transition-colors",
        "hover:bg-(--control-hover)",
      )}
    >
      {children}
    </button>
  );
}
