"use client";

import { cn } from "cn";
import { Play } from "lucide-react";
import Image from "next/image";
import { useImperativeHandle, useLayoutEffect, useRef, useState, type Ref } from "react";

export type VideoEmbedHandle = { pause: () => void };

type VideoEmbedProps = {
  youtubeId: string;
  title: string;
  poster: { src: string; blurDataURL: string };
  className?: string;
  ref?: Ref<VideoEmbedHandle>;
};

/**
 * Poster first; the YouTube iframe loads only when someone presses play (spec §8, §12.5). Uses the
 * privacy-enhanced domain so YouTube sets no cookies until the video plays.
 */
export function VideoEmbed({ youtubeId, title, poster, className, ref }: VideoEmbedProps) {
  const [loaded, setLoaded] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      pause: () =>
        frameRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
          "https://www.youtube-nocookie.com",
        ),
    }),
    [],
  );

  // Cache Components keeps pages you navigate away from in the DOM (hidden by React Activity), and
  // `display: none` doesn't stop an iframe playing. Unload the video whenever this page is hidden
  // so it can't keep playing, or restart via `autoplay=1`, on another page. The poster comes back.
  useLayoutEffect(() => () => setLoaded(false), []);

  return (
    <div className={cn("relative aspect-video overflow-hidden rounded-xl bg-black", className)}>
      {loaded ? (
        <iframe
          ref={frameRef}
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&enablejsapi=1&playsinline=1&rel=0`}
          title={`${title} (YouTube video)`}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 size-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="group absolute inset-0 size-full"
        >
          <Image
            src={poster.src}
            alt=""
            fill
            sizes="(min-width: 1280px) 560px, (min-width: 1024px) 460px, 100vw"
            placeholder="blur"
            blurDataURL={poster.blurDataURL}
            className="object-cover"
          />
          <span className="absolute inset-0 bg-navy/25 transition-colors group-hover:bg-navy/10" />
          <span className="absolute top-1/2 left-1/2 grid size-16 -translate-1/2 place-items-center rounded-full bg-pale text-navy shadow-lg transition-transform group-hover:scale-105 motion-reduce:transition-none">
            <Play aria-hidden="true" className="ml-1 size-7 fill-current" />
          </span>
          <span className="sr-only">Play video: {title}</span>
        </button>
      )}
    </div>
  );
}
