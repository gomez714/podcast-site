"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

import { formatClock, formatSpokenTime } from "@/lib/media/format-time";

const KEY_STEP = 5;
const PAGE_STEP = 30;

type AudioTimelineProps = {
  currentTime: number;
  duration?: number;
  bufferedEnd?: number;
  onSeek: (seconds: number) => void;
};

const percent = (value: number | undefined, duration: number) =>
  value === undefined ? 0 : Math.min(100, Math.max(0, (value / duration) * 100));

/**
 * Native range input, so keyboard and screen-reader support come with it. Pointer drags only
 * preview the position; the seek happens on release so the stream isn't hit on every pixel.
 */
export function AudioTimeline({ currentTime, duration, bufferedEnd, onSeek }: AudioTimelineProps) {
  const [scrubTime, setScrubTime] = useState<number>();
  // Browsers change the value on pointer-down, before React re-renders, so drag state is a ref.
  const dragging = useRef(false);
  const pending = useRef<number>(undefined);
  const known = duration !== undefined;
  const shown = scrubTime ?? currentTime;
  const max = duration ?? 0;

  const endDrag = (commit: boolean) => {
    if (!dragging.current) return;
    dragging.current = false;
    if (commit && pending.current !== undefined) onSeek(pending.current);
    pending.current = undefined;
    setScrubTime(undefined);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const steps: Record<string, number> = {
      ArrowLeft: -KEY_STEP,
      ArrowDown: -KEY_STEP,
      ArrowRight: KEY_STEP,
      ArrowUp: KEY_STEP,
      PageDown: -PAGE_STEP,
      PageUp: PAGE_STEP,
    };
    if (event.key in steps) onSeek(currentTime + steps[event.key]);
    else if (event.key === "Home") onSeek(0);
    else if (event.key === "End" && known) onSeek(max);
    else return;
    event.preventDefault();
  };

  const style = {
    "--played": `${known ? percent(shown, max) : 0}%`,
    "--buffered": `${known ? percent(bufferedEnd, max) : 0}%`,
  } as CSSProperties;

  return (
    <div>
      <input
        type="range"
        className="audio-range"
        style={style}
        aria-label="Seek"
        aria-valuetext={`${formatSpokenTime(shown)} of ${known ? formatSpokenTime(max) : "unknown length"}`}
        min={0}
        max={max}
        step="any"
        value={Math.min(shown, max)}
        disabled={!known}
        onKeyDown={onKeyDown}
        onPointerDown={() => {
          dragging.current = true;
          // The release can land outside the slider; listen on the window rather than capturing.
          window.addEventListener("pointerup", () => endDrag(true), { once: true });
          window.addEventListener("pointercancel", () => endDrag(false), { once: true });
        }}
        onChange={(event) => {
          const value = Number(event.target.value);
          if (!dragging.current) {
            onSeek(value);
            return;
          }
          pending.current = value;
          setScrubTime(value);
        }}
        onBlur={() => endDrag(true)}
      />
      <div className="mt-1 flex justify-between text-xs font-semibold tabular-nums">
        <span>{formatClock(shown)}</span>
        <span>{formatClock(duration)}</span>
      </div>
    </div>
  );
}
