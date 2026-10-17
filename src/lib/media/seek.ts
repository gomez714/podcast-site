const isUsable = (value: number | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

/**
 * The media element's own duration once it's valid, otherwise the RSS estimate (spec §6.2).
 * Streams can report NaN, Infinity or 0 before metadata arrives.
 */
export function effectiveDuration(
  mediaDuration: number | undefined,
  feedDuration: number | undefined,
): number | undefined {
  if (isUsable(mediaDuration)) return mediaDuration;
  if (isUsable(feedDuration)) return feedDuration;
  return undefined;
}

/** Clamps a requested position to `[0, duration]`, or to `[0, ∞)` when the duration is unknown. */
export function clampSeek(target: number, duration: number | undefined): number {
  if (!Number.isFinite(target)) return 0;
  const upper = isUsable(duration) ? duration : Number.POSITIVE_INFINITY;
  return Math.min(Math.max(0, target), upper);
}

/** End of the furthest seekable range, when the browser reports one. */
export function seekableEnd(ranges: TimeRanges | undefined): number | undefined {
  if (!ranges || ranges.length === 0) return undefined;
  const end = ranges.end(ranges.length - 1);
  return isUsable(end) ? end : undefined;
}

/** End of the buffered range that contains `time`, for the timeline's buffered bar. */
export function bufferedEnd(ranges: TimeRanges | undefined, time: number): number | undefined {
  if (!ranges) return undefined;
  for (let i = 0; i < ranges.length; i++) {
    if (ranges.start(i) <= time + 0.5 && time <= ranges.end(i)) return ranges.end(i);
  }
  return undefined;
}
