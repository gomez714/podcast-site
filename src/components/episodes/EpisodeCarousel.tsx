"use client";

import { cn } from "cn";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Below desktop width a row of episode cards becomes a native scroll-snap row (approved change, spec
 * §3.3): swipe works without JavaScript, and the arrows/dots are layered on once the row is
 * measured. At `lg` the same list is a plain three-column grid and the controls are hidden.
 *
 * The bleed classes must mirror the `Container` gutter so the first card lines up with the copy.
 */
export function EpisodeCarousel({ label, children }: { label: string; children: ReactNode }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [stops, setStops] = useState<number[]>([]);
  const [active, setActive] = useState(0);

  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    if (max <= 1) {
      setStops([]);
      return;
    }
    const pad = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
    const next = [...track.children]
      .map((item) => (item as HTMLElement).offsetLeft - pad)
      .filter((left) => left < max - 1);
    next.push(max);
    setStops(next);

    const left = track.scrollLeft;
    let nearest = 0;
    next.forEach((stop, i) => {
      if (Math.abs(stop - left) < Math.abs(next[nearest] - left)) nearest = i;
    });
    setActive(nearest);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(track);
    track.addEventListener("scroll", sync, { passive: true });
    return () => {
      observer.disconnect();
      track.removeEventListener("scroll", sync);
    };
  }, [sync]);

  const go = (index: number) => {
    const track = trackRef.current;
    const left = stops[index];
    if (!track || left === undefined) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
  };

  const hasControls = stops.length > 1;

  return (
    <div className="mt-11">
      <ul
        ref={trackRef}
        aria-label={label}
        className={cn(
          "relative flex snap-x snap-mandatory [scrollbar-width:none] gap-[18px] overflow-x-auto overscroll-x-contain pt-2 pb-4 [&::-webkit-scrollbar]:hidden",
          "-mx-[clamp(1.125rem,6vw,5.625rem)] scroll-px-[clamp(1.125rem,6vw,5.625rem)] px-[clamp(1.125rem,6vw,5.625rem)]",
          "lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:p-0",
          "[&>li]:w-[85%] [&>li]:shrink-0 [&>li]:snap-start md:[&>li]:w-[46%] lg:[&>li]:w-auto",
        )}
      >
        {children}
      </ul>

      <div className="mt-3 flex min-h-11 items-center justify-between gap-4 lg:hidden">
        {hasControls && (
          <>
            <div aria-hidden="true" className="flex gap-2">
              {stops.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-2 rounded-full transition-[width,background-color] motion-reduce:transition-none",
                    i === active ? "w-6 bg-navy" : "w-2 bg-slate/30",
                  )}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <ArrowButton
                label="Previous episode"
                disabled={active === 0}
                onClick={() => go(active - 1)}
              >
                ←
              </ArrowButton>
              <ArrowButton
                label="Next episode"
                disabled={active === stops.length - 1}
                onClick={() => go(active + 1)}
              >
                →
              </ArrowButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ArrowButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-11 place-items-center rounded-full border border-line-light bg-white text-lg font-bold text-navy transition-colors hover:border-navy disabled:cursor-default disabled:opacity-35 disabled:hover:border-line-light"
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}
