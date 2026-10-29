"use client";

import { track } from "@vercel/analytics";
import { cn } from "cn";
import { RefreshCw, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type Ref,
} from "react";

import { ANALYTICS_EVENTS } from "@/lib/analytics";
import {
  initialPlayerState,
  playerReducer,
  type PlaybackSnapshot,
  type PlayerErrorKind,
  type PlayerEvent,
} from "@/lib/media/player-state";
import { bufferedEnd, clampSeek, effectiveDuration, seekableEnd } from "@/lib/media/seek";

import coverArt from "../../../public/images/brand/cover-art.jpg";
import { AudioTimeline } from "./AudioTimeline";
import { PlaybackControls, SKIP_BACK_SECONDS, SKIP_FORWARD_SECONDS } from "./PlaybackControls";
import { PlaybackSpeed } from "./PlaybackSpeed";

export type AudioPlayerHandle = {
  pause: () => void;
  /** Seeks and starts playback; only call from a user action so browsers allow it. */
  playFrom: (seconds: number) => void;
  /** Play/pause, as the main button does; for controls outside the player (the mini-player). */
  toggle: () => void;
};

type AudioPlayerProps = {
  src: string;
  title: string;
  guestName?: string;
  /** RSS duration, shown until the audio reports its own. */
  durationHint?: number;
  tone?: "dark" | "light";
  /** Hide the cover art and title when the page already shows them next to the player. */
  showHeader?: boolean;
  className?: string;
  /** Mirrors playback state outward, e.g. to the docked mini-player. */
  onStateChange?: (snapshot: PlaybackSnapshot) => void;
  ref?: Ref<AudioPlayerHandle>;
};

const ERROR_MESSAGES: Record<PlayerErrorKind, string> = {
  network: "The audio stopped loading. Check your connection, then try again.",
  unavailable: "This episode's audio couldn't be loaded right now.",
  blocked: "Your browser didn't let playback start. Press play to try again.",
};

const subscribeNoop = () => () => {};

/**
 * The loading ring waits this long before appearing, and then stays at least `BUSY_MIN_VISIBLE_MS`.
 * Seeks and skips often load in a few milliseconds; showing a spinner (and a "Loading audio…" line)
 * for those, or one that blinked on and off, made the player flicker (Oct 29, 2026).
 */
const BUSY_DELAY_MS = 350;
const BUSY_MIN_VISIBLE_MS = 500;

/** A loading indicator that ignores brief waits and never blinks: delayed on, held for a minimum. */
function useBusyIndicator(active: boolean): boolean {
  const [visible, setVisible] = useState(false);
  const shownAt = useRef(0);
  useEffect(() => {
    if (active === visible) return;
    const wait = active
      ? BUSY_DELAY_MS
      : Math.max(0, BUSY_MIN_VISIBLE_MS - (performance.now() - shownAt.current));
    const timer = window.setTimeout(() => {
      if (active) shownAt.current = performance.now();
      setVisible(active);
    }, wait);
    return () => window.clearTimeout(timer);
  }, [active, visible]);
  return visible;
}

/**
 * Branded player on a native `<audio>` element (spec §7). Until hydration, and if JavaScript never
 * runs, the browser's own controls are shown instead, so listening never depends on this UI.
 * Remount with a `key` per episode so a new source always starts from a clean state.
 */
export function AudioPlayer({
  src,
  title,
  guestName,
  durationHint,
  tone = "dark",
  showHeader = true,
  className,
  onStateChange,
  ref,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [state, dispatch] = useReducer(playerReducer, initialPlayerState);
  const enhanced = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = () =>
      dispatch({
        type: "time",
        currentTime: audio.currentTime,
        bufferedEnd: bufferedEnd(audio.buffered, audio.currentTime),
      });
    const handlers: Record<string, () => void> = {
      loadedmetadata: () => dispatch({ type: "duration", duration: audio.duration }),
      durationchange: () => dispatch({ type: "duration", duration: audio.duration }),
      timeupdate: time,
      progress: time,
      playing: () => dispatch({ type: "playing" }),
      pause: () => dispatch({ type: "pause" }),
      ended: () => dispatch({ type: "ended" }),
      waiting: () => dispatch({ type: "waiting" }),
      stalled: () => dispatch({ type: "waiting" }),
      canplay: () => dispatch({ type: "canplay" }),
      seeking: () => dispatch({ type: "seeking", currentTime: audio.currentTime }),
      seeked: () => dispatch({ type: "seeked", currentTime: audio.currentTime }),
      ratechange: () => dispatch({ type: "rate", rate: audio.playbackRate }),
      volumechange: () => dispatch({ type: "volume", volume: audio.volume, muted: audio.muted }),
      error: () => dispatch({ type: "mediaError", code: audio.error?.code ?? 4 }),
    };
    for (const [name, handler] of Object.entries(handlers)) audio.addEventListener(name, handler);

    // The native controls may have been used before hydration; pick up where they are.
    const sync: PlayerEvent[] = [
      { type: "duration", duration: audio.duration },
      { type: "seeked", currentTime: audio.currentTime },
      { type: "volume", volume: audio.volume, muted: audio.muted },
    ];
    sync.forEach(dispatch);
    if (!audio.paused) dispatch({ type: "playing" });
    if (audio.error) dispatch({ type: "mediaError", code: audio.error.code });

    return () => {
      for (const [name, handler] of Object.entries(handlers)) {
        audio.removeEventListener(name, handler);
      }
      audio.pause();
    };
  }, [src]);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.ended) audio.currentTime = 0;
    dispatch({ type: "requestPlay" });
    try {
      await audio.play();
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      if (name === "AbortError") return;
      dispatch({ type: "playRejected", blocked: name === "NotAllowedError" });
    }
  }, []);

  /** Counted once per press that starts playback; a press isn't a listen (Fusebox counts those). */
  const trackPlay = useCallback(
    () => track(ANALYTICS_EVENTS.playPressed, { episode: title }),
    [title],
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (state.status === "playing" || state.status === "loading") audio.pause();
    else {
      trackPlay();
      void play();
    }
  }, [play, state.status, trackPlay]);

  const applySeek = useCallback(
    (target: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      const duration = effectiveDuration(audio.duration, durationHint);
      const limit = seekableEnd(audio.seekable) ?? duration;
      audio.currentTime = clampSeek(target, limit);
      // Show the element's new position now rather than at its async `seeking` event. Otherwise the
      // seek bar's drag preview is cleared first and the marker snaps back to the old time for a
      // frame (new -> old -> new). The value is read back from the element, not assumed.
      dispatch({ type: "seeking", currentTime: audio.currentTime });
    },
    [durationHint],
  );

  /** Seeks once the audio's length is known, and starts playback; only call from a user action. */
  const playFrom = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) applySeek(seconds);
      else {
        audio.addEventListener("loadedmetadata", () => applySeek(seconds), { once: true });
        // Nothing is loaded yet (preload="none"), so hold the marker at the requested spot until
        // the audio can seek there; without this it sat at 0:00 for a second or more.
        const target = clampSeek(seconds, effectiveDuration(audio.duration, durationHint));
        dispatch({ type: "seeking", currentTime: target });
      }
      if (audio.paused) trackPlay();
      void play();
    },
    [applySeek, durationHint, play, trackPlay],
  );

  // With preload="none" nothing is loaded before the first play, so a seek then would be lost.
  // Dragging the bar, a skip button or a chapter before playing starts the episode from there.
  const seekTo = useCallback(
    (target: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      if (audio.readyState === HTMLMediaElement.HAVE_NOTHING && audio.paused) playFrom(target);
      else applySeek(target);
    },
    [applySeek, playFrom],
  );

  const skip = useCallback(
    (seconds: number) => seekTo((audioRef.current?.currentTime ?? 0) + seconds),
    [seekTo],
  );

  useImperativeHandle(
    ref,
    () => ({
      pause: () => audioRef.current?.pause(),
      playFrom,
      toggle,
    }),
    [playFrom, toggle],
  );

  /** One manual retry per press; never retries on its own (spec §7.4). */
  const retry = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (state.error === "blocked") {
      void play();
      return;
    }
    const resumeAt = state.currentTime;
    dispatch({ type: "retry" });
    audio.addEventListener(
      "loadedmetadata",
      () => {
        if (resumeAt > 0) audio.currentTime = resumeAt;
      },
      { once: true },
    );
    audio.load();
    void play();
  };

  useEffect(() => {
    if (!enhanced || !("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    session.metadata = new MediaMetadata({
      title,
      artist: guestName ?? "The Bottom Left Pane",
      album: "The Bottom Left Pane",
      artwork: [
        { src: coverArt.src, sizes: `${coverArt.width}x${coverArt.height}`, type: "image/jpeg" },
      ],
    });
    const actions: [MediaSessionAction, MediaSessionActionHandler][] = [
      ["play", () => void play()],
      ["pause", () => audioRef.current?.pause()],
      ["seekbackward", () => skip(-SKIP_BACK_SECONDS)],
      ["seekforward", () => skip(SKIP_FORWARD_SECONDS)],
      ["seekto", (details) => details.seekTime !== undefined && seekTo(details.seekTime)],
    ];
    for (const [action, handler] of actions) {
      try {
        session.setActionHandler(action, handler);
      } catch {
        // Not every browser supports every action.
      }
    }
    return () => {
      for (const [action] of actions) {
        try {
          session.setActionHandler(action, null);
        } catch {
          // Ignore unsupported actions.
        }
      }
    };
  }, [enhanced, guestName, play, seekTo, skip, title]);

  const withAudio = (apply: (audio: HTMLAudioElement) => void) => {
    if (audioRef.current) apply(audioRef.current);
  };

  const duration = effectiveDuration(state.duration, durationHint);
  const busy = useBusyIndicator(state.status === "loading" || state.buffering);
  // Announced and mirrored to the mini-player only while it's genuinely still loading.
  const buffering = state.buffering && busy;

  useEffect(() => {
    onStateChange?.({
      status: state.status,
      buffering,
      currentTime: state.currentTime,
      duration,
    });
  }, [onStateChange, state.status, buffering, state.currentTime, duration]);

  const errorMessage = state.error ? ERROR_MESSAGES[state.error] : undefined;

  return (
    <section
      aria-label={`Audio player: ${title}`}
      className={cn(
        "audio-player rounded-xl border p-4 sm:p-6",
        tone === "dark" ? "audio-player-dark" : "audio-player-light",
        className,
      )}
    >
      {showHeader && (
        <div className="mb-5 flex items-center gap-4">
          <Image
            src={coverArt}
            alt=""
            sizes="96px"
            className="size-16 shrink-0 rounded-md sm:size-24"
          />
          <div className="min-w-0">
            <p className="eyebrow text-(--player-muted)">Audio</p>
            <p className="mt-1.5 line-clamp-2 leading-snug font-bold">{title}</p>
            {guestName && <p className="mt-0.5 text-sm text-(--player-muted)">with {guestName}</p>}
          </div>
        </div>
      )}

      {/*
        preload="none" (host's decision, Oct 29, 2026): nothing is requested from Fusebox until
        someone presses play. With "metadata", every episode page view fetched 220 KB–1 MB of
        audio through Fusebox's tracked URL, and Fusebox counted those views as listens. The
        length shown before play comes from the RSS feed (`durationHint`).
      */}
      <audio ref={audioRef} src={src} preload="none" className="hidden" />
      {/*
        Without JavaScript the browser's own player is shown instead. The custom controls are
        server-rendered too (and hidden when scripting is off), so the page doesn't jump when
        React takes over, as it did when native controls were swapped for these.
      */}
      <noscript>
        <audio src={src} controls preload="none" className="w-full" />
      </noscript>

      <div className="grid gap-4 noscript:hidden">
        <div className="flex justify-center">
          <PlaybackControls status={state.status} busy={busy} onToggle={toggle} onSkip={skip} />
        </div>

        <AudioTimeline
          currentTime={state.currentTime}
          duration={duration}
          bufferedEnd={state.bufferedEnd}
          onSeek={seekTo}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <PlaybackSpeed
            rate={state.rate}
            onChange={(rate) =>
              withAudio((audio) => {
                audio.playbackRate = rate;
              })
            }
          />
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={state.muted ? "Unmute" : "Mute"}
              onClick={() =>
                withAudio((audio) => {
                  audio.muted = !audio.muted;
                })
              }
              className="grid size-11 place-items-center rounded-full hover:bg-(--control-hover)"
            >
              {state.muted || state.volume === 0 ? (
                <VolumeX aria-hidden="true" className="size-5" />
              ) : (
                <Volume2 aria-hidden="true" className="size-5" />
              )}
            </button>
            {/* Phones control volume with hardware buttons, and iOS ignores `volume`. */}
            <input
              type="range"
              aria-label="Volume"
              className="audio-range audio-range-volume w-24 pointer-coarse:hidden"
              style={{ "--played": `${(state.muted ? 0 : state.volume) * 100}%` } as CSSProperties}
              min={0}
              max={1}
              step={0.05}
              value={state.muted ? 0 : state.volume}
              onChange={(event) => {
                const volume = Number(event.target.value);
                withAudio((audio) => {
                  audio.volume = volume;
                  audio.muted = volume === 0;
                });
              }}
            />
          </div>
        </div>
      </div>

      {/*
        Loading is shown by the ring around the play button and announced to screen readers only:
        a visible "Loading audio…" line here changed the player's height on every seek, so the
        page below jumped (the "flicker", Oct 29, 2026). Errors stay visible; they're rare and
        come with a Try again button.
      */}
      <div role="status" aria-live="polite" className={cn(errorMessage && "mt-4")}>
        {errorMessage ? (
          <p className="text-sm text-(--player-muted)">{errorMessage}</p>
        ) : (
          buffering && <p className="sr-only">Loading audio…</p>
        )}
      </div>
      {state.error && (
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold">
          <button
            type="button"
            onClick={retry}
            className="audio-chip inline-flex items-center gap-2"
          >
            <RefreshCw aria-hidden="true" className="size-4" />
            Try again
          </button>
          {state.error !== "blocked" && (
            <a href={src} className="underline underline-offset-4">
              Open the audio file
            </a>
          )}
        </div>
      )}
    </section>
  );
}
