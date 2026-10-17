/**
 * Audio player UI state, derived only from media element events (spec §7.4). The UI never says
 * "playing" because a button was pressed; it waits for the element's `playing` event.
 */

export type PlayerStatus =
  /** Nothing requested yet, or reset after a source change. */
  | "idle"
  /** Play was requested; waiting for the element to actually start. */
  | "loading"
  | "playing"
  | "paused"
  | "ended"
  | "error";

export type PlayerErrorKind = "network" | "unavailable" | "blocked";

export type PlayerState = {
  status: PlayerStatus;
  /** Playback stalled waiting for data while the listener expects sound. */
  buffering: boolean;
  seeking: boolean;
  currentTime: number;
  /** The element's own duration, once valid. */
  duration?: number;
  bufferedEnd?: number;
  rate: number;
  volume: number;
  muted: boolean;
  error?: PlayerErrorKind;
};

export type PlayerEvent =
  | { type: "requestPlay" }
  | { type: "playRejected"; blocked: boolean }
  | { type: "duration"; duration: number }
  | { type: "time"; currentTime: number; bufferedEnd?: number }
  | { type: "playing" }
  | { type: "pause" }
  | { type: "ended" }
  | { type: "waiting" }
  | { type: "canplay" }
  | { type: "seeking"; currentTime: number }
  | { type: "seeked"; currentTime: number }
  | { type: "rate"; rate: number }
  | { type: "volume"; volume: number; muted: boolean }
  /** `MediaError.code`: 1 aborted, 2 network, 3 decode, 4 source unsupported or unreachable. */
  | { type: "mediaError"; code: number }
  | { type: "retry" }
  | { type: "reset" };

export const initialPlayerState: PlayerState = {
  status: "idle",
  buffering: false,
  seeking: false,
  currentTime: 0,
  rate: 1,
  volume: 1,
  muted: false,
};

const expectsSound = (status: PlayerStatus) => status === "loading" || status === "playing";

export function playerReducer(state: PlayerState, event: PlayerEvent): PlayerState {
  switch (event.type) {
    case "requestPlay":
      return state.status === "playing" ? state : { ...state, status: "loading", error: undefined };

    case "playRejected":
      if (state.status === "error") return state;
      return event.blocked
        ? { ...state, status: "paused", buffering: false, error: "blocked" }
        : { ...state, status: "error", buffering: false, error: "unavailable" };

    case "duration":
      return Number.isFinite(event.duration) && event.duration > 0
        ? { ...state, duration: event.duration }
        : state;

    case "time":
      return { ...state, currentTime: event.currentTime, bufferedEnd: event.bufferedEnd };

    case "playing":
      return { ...state, status: "playing", buffering: false, error: undefined };

    case "pause":
      return state.status === "error" || state.status === "ended"
        ? state
        : { ...state, status: "paused", buffering: false };

    case "ended":
      return { ...state, status: "ended", buffering: false };

    case "waiting":
      return expectsSound(state.status) ? { ...state, buffering: true } : state;

    case "canplay":
      return { ...state, buffering: false };

    case "seeking":
      return {
        ...state,
        seeking: true,
        currentTime: event.currentTime,
        status: state.status === "ended" ? "paused" : state.status,
      };

    case "seeked":
      return { ...state, seeking: false, currentTime: event.currentTime };

    case "rate":
      return { ...state, rate: event.rate };

    case "volume":
      return { ...state, volume: event.volume, muted: event.muted };

    case "mediaError":
      if (event.code === 1) return state;
      return {
        ...state,
        status: "error",
        buffering: false,
        seeking: false,
        error: event.code === 2 ? "network" : "unavailable",
      };

    case "retry":
      return { ...state, status: "idle", buffering: false, error: undefined };

    case "reset":
      return { ...initialPlayerState, rate: state.rate, volume: state.volume, muted: state.muted };
  }
}

/** What the docked mini-player needs from the main player. */
export type PlaybackSnapshot = {
  status: PlayerStatus;
  buffering: boolean;
  currentTime: number;
  duration?: number;
};

export const initialPlaybackSnapshot: PlaybackSnapshot = {
  status: "idle",
  buffering: false,
  currentTime: 0,
};

/**
 * The docked bar appears only once audio has actually played, while listening (not watching), and
 * only when the main player has scrolled out of view, so it never duplicates visible controls.
 */
export function shouldShowMiniPlayer({
  started,
  playerVisible,
  mode,
}: {
  started: boolean;
  playerVisible: boolean;
  mode: "listen" | "watch";
}): boolean {
  return started && !playerVisible && mode === "listen";
}
