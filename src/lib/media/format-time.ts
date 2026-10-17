const isKnown = (seconds: number | undefined): seconds is number =>
  typeof seconds === "number" && Number.isFinite(seconds) && seconds >= 0;

/** "9:42" or "1:02:03". Unknown or invalid values render as "--:--". */
export function formatClock(seconds: number | undefined): string {
  if (!isKnown(seconds)) return "--:--";

  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

const unit = (value: number, word: string) => `${value} ${word}${value === 1 ? "" : "s"}`;

/** "9 minutes 42 seconds", for screen readers (slider `aria-valuetext`). */
export function formatSpokenTime(seconds: number | undefined): string {
  if (!isKnown(seconds)) return "unknown";

  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const parts = [
    h && unit(h, "hour"),
    m && unit(m, "minute"),
    (s || total === 0) && unit(s, "second"),
  ];
  return parts.filter(Boolean).join(" ");
}
