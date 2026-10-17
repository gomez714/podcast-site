"use client";

import { cn } from "cn";
import { useEffect, useRef, useState, type ComponentProps } from "react";

/** Ignore scroll jitter smaller than this before hiding or revealing. */
const THRESHOLD = 8;

/**
 * Below `lg` the header sticks to the top but slides away while scrolling down and returns on any
 * scroll up (approved change, spec §3.4), so the menu is always one flick away without covering
 * what you're reading. It stays visible near the top of the page and while it holds focus. From
 * `lg` up it is a normal static header.
 */
export function HeaderReveal({ className, children, ...props }: ComponentProps<"header">) {
  const ref = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const header = ref.current;
      if (!header) return;
      const y = window.scrollY;
      const delta = y - lastY;
      if (y <= header.offsetHeight) {
        setHidden(false);
        lastY = y;
      } else if (Math.abs(delta) >= THRESHOLD) {
        setHidden(delta > 0 && !header.contains(document.activeElement));
        lastY = y;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      ref={ref}
      data-hidden={hidden || undefined}
      onFocus={() => setHidden(false)}
      className={cn(
        "sticky top-0 z-30 transition-transform duration-300 data-hidden:-translate-y-full motion-reduce:transition-none lg:relative lg:z-10 lg:data-hidden:translate-y-0",
        className,
      )}
      {...props}
    >
      {children}
    </header>
  );
}
