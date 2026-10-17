"use client";

export const PLAYBACK_RATES = [1, 1.25, 1.5, 1.75, 2] as const;

/** One button that steps through the rates, as most podcast apps do (spec §7.2). */
export function PlaybackSpeed({
  rate,
  onChange,
}: {
  rate: number;
  onChange: (rate: number) => void;
}) {
  const index = PLAYBACK_RATES.findIndex((candidate) => candidate === rate);
  const next = PLAYBACK_RATES[(index + 1) % PLAYBACK_RATES.length];

  return (
    <button
      type="button"
      aria-label={`Playback speed ${rate}×. Change to ${next}×`}
      onClick={() => onChange(next)}
      className="audio-chip min-w-[3.5rem] tabular-nums"
    >
      {rate}×
    </button>
  );
}
