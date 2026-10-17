"use client";

import { Play } from "lucide-react";
import { useState } from "react";

import type { Chapter } from "@/lib/episodes/show-notes";
import { formatClock, formatSpokenTime } from "@/lib/media/format-time";

import { useEpisodeMedia } from "./EpisodeMedia";
import { ShowMoreList } from "./ShowMoreList";

/** Chapters from the show notes; each one plays the audio from that point (spec §5.3 item 6). */
export function EpisodeChapters({ chapters }: { chapters: Chapter[] }) {
  const { playFrom } = useEpisodeMedia();
  const [announcement, setAnnouncement] = useState("");

  return (
    <>
      <ShowMoreList
        ordered
        visible={8}
        noun="chapters"
        className="divide-y divide-line-light border-y border-line-light"
        items={chapters.map((chapter) => ({
          key: chapter.startSeconds,
          content: (
            <button
              type="button"
              aria-label={`Play from ${formatSpokenTime(chapter.startSeconds)}: ${chapter.title}`}
              onClick={() => {
                playFrom(chapter.startSeconds);
                setAnnouncement(`Playing from ${formatClock(chapter.startSeconds)}`);
              }}
              className="group flex min-h-11 w-full items-start gap-4 py-3 text-left text-sm text-navy hover:bg-pale/60"
            >
              <span className="flex w-16 shrink-0 items-center gap-1.5 font-bold text-slate tabular-nums">
                <Play aria-hidden="true" className="size-3 fill-current" />
                {formatClock(chapter.startSeconds)}
              </span>
              <span className="group-hover:underline">{chapter.title}</span>
            </button>
          ),
        }))}
      />
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </>
  );
}
