"use client";

import { Tabs } from "@base-ui/react/tabs";
import { Headphones, MonitorPlay } from "lucide-react";
import Image from "next/image";
import {
  createContext,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

import { AudioPlayer, type AudioPlayerHandle } from "@/components/media/AudioPlayer";
import { MiniPlayer } from "@/components/media/MiniPlayer";
import { VideoEmbed, type VideoEmbedHandle } from "@/components/media/VideoEmbed";
import { ExternalLink } from "@/components/ui/external-link";
import { ANALYTICS_EVENTS, trackClicks } from "@/lib/analytics";
import type { EpisodeArtwork } from "@/lib/episodes/types";
import { initialPlaybackSnapshot, type PlaybackSnapshot } from "@/lib/media/player-state";

import fallbackArt from "../../../public/images/brand/episode-fallback.jpg";

type MediaMode = "listen" | "watch";

type EpisodeMediaContextValue = {
  mode: MediaMode;
  selectMode: (mode: MediaMode) => void;
  /** Switches to Listen and plays from a chapter. Video timings differ, so chapters are audio-only. */
  playFrom: (seconds: number) => void;
  audioRef: RefObject<AudioPlayerHandle | null>;
  videoRef: RefObject<VideoEmbedHandle | null>;
  /** The main media module, so the mini-player knows when it's on screen. */
  playerRef: RefObject<HTMLDivElement | null>;
  onPlaybackChange: (snapshot: PlaybackSnapshot) => void;
};

const EpisodeMediaContext = createContext<EpisodeMediaContextValue | null>(null);

export function useEpisodeMedia() {
  const value = use(EpisodeMediaContext);
  if (!value) throw new Error("useEpisodeMedia must be used inside <EpisodeMediaProvider>");
  return value;
}

/**
 * Shares one Listen/Watch state between the player, the chapter list further down the page and the
 * docked mini-player, which is rendered after the page content.
 */
export function EpisodeMediaProvider({ title, children }: { title: string; children: ReactNode }) {
  const [mode, setMode] = useState<MediaMode>("listen");
  const audioRef = useRef<AudioPlayerHandle>(null);
  const videoRef = useRef<VideoEmbedHandle>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  // Kept out of the shared context value so ~4 updates a second re-render only the mini-player.
  const [playback, setPlayback] = useState<PlaybackSnapshot>(initialPlaybackSnapshot);
  const [started, setStarted] = useState(false);

  const onPlaybackChange = useCallback((snapshot: PlaybackSnapshot) => {
    setPlayback(snapshot);
    if (snapshot.status === "playing") setStarted(true);
  }, []);

  const selectMode = useCallback((next: MediaMode) => {
    // Only one thing plays at a time, and switching never starts playback (spec §5.3).
    if (next === "watch") audioRef.current?.pause();
    else videoRef.current?.pause();
    setMode(next);
  }, []);

  const playFrom = useCallback(
    (seconds: number) => {
      selectMode("listen");
      audioRef.current?.playFrom(seconds);
    },
    [selectMode],
  );

  const value = useMemo(
    () => ({ mode, selectMode, playFrom, audioRef, videoRef, playerRef, onPlaybackChange }),
    [mode, selectMode, playFrom, onPlaybackChange],
  );
  return (
    <EpisodeMediaContext value={value}>
      {children}
      <MiniPlayer
        title={title}
        playback={playback}
        started={started}
        mode={mode}
        playerRef={playerRef}
        onToggle={() => audioRef.current?.toggle()}
      />
    </EpisodeMediaContext>
  );
}

type EpisodeMediaProps = {
  title: string;
  guestName: string;
  audioUrl: string;
  durationSeconds?: number;
  youtubeId?: string;
  artwork: EpisodeArtwork;
};

/**
 * Primary media module (spec §5.3, §10.3). Audio is the default. Filmed episodes get Listen and
 * Watch tabs; both panels stay mounted so switching back keeps your place. Audio-only episodes get
 * the player alone, with no empty video tab.
 */
export function EpisodeMedia({
  title,
  guestName,
  audioUrl,
  durationSeconds,
  youtubeId,
  artwork,
}: EpisodeMediaProps) {
  const { mode, selectMode, audioRef, videoRef, playerRef, onPlaybackChange } = useEpisodeMedia();
  const image = artwork.kind === "youtube" ? artwork : fallbackArt;

  const listen = (
    <div className="grid gap-4">
      {/* Below `md` the art would push the controls off the first screen (spec §7.3). */}
      <div className="relative hidden aspect-video overflow-hidden rounded-xl bg-navy md:block">
        <Image
          src={image.src}
          alt=""
          fill
          // Not `preload`: phones never show this image, so it mustn't be fetched from <head>.
          fetchPriority="high"
          sizes="(min-width: 1280px) 560px, (min-width: 1024px) 460px, 100vw"
          placeholder="blur"
          blurDataURL={image.blurDataURL}
          className="object-cover"
        />
      </div>
      <AudioPlayer
        ref={audioRef}
        src={audioUrl}
        title={title}
        guestName={guestName}
        durationHint={durationSeconds}
        showHeader={false}
        onStateChange={onPlaybackChange}
      />
    </div>
  );

  if (!youtubeId || artwork.kind !== "youtube") return <div ref={playerRef}>{listen}</div>;

  return (
    <Tabs.Root
      ref={playerRef}
      value={mode}
      onValueChange={(value) => selectMode(value as MediaMode)}
    >
      <Tabs.List
        aria-label="Choose how to follow this episode"
        className="mb-4 inline-flex gap-1 rounded-full border border-line-dark p-1"
      >
        <Tabs.Tab value="listen" className="media-tab">
          <Headphones aria-hidden="true" className="size-4" />
          Listen
        </Tabs.Tab>
        <Tabs.Tab value="watch" className="media-tab">
          <MonitorPlay aria-hidden="true" className="size-4" />
          Watch
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="listen" keepMounted>
        {listen}
      </Tabs.Panel>
      <Tabs.Panel value="watch" keepMounted className="grid gap-3">
        <VideoEmbed ref={videoRef} youtubeId={youtubeId} title={title} poster={artwork} />
        <p className="text-sm text-pale">
          Plays from YouTube.{" "}
          <ExternalLink
            href={`https://www.youtube.com/watch?v=${youtubeId}`}
            className="font-bold text-white underline underline-offset-4"
            {...trackClicks(ANALYTICS_EVENTS.platformClick, {
              platform: "YouTube",
              placement: "Episode video",
            })}
          >
            Watch on YouTube
          </ExternalLink>
        </p>
      </Tabs.Panel>
    </Tabs.Root>
  );
}
