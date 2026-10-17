import { describe, expect, it } from "vitest";

import { formatClock, formatSpokenTime } from "@/lib/media/format-time";
import {
  initialPlayerState,
  playerReducer,
  shouldShowMiniPlayer,
  type PlayerEvent,
  type PlayerState,
} from "@/lib/media/player-state";
import { clampSeek, effectiveDuration } from "@/lib/media/seek";

const run = (events: PlayerEvent[], from: PlayerState = initialPlayerState) =>
  events.reduce(playerReducer, from);

describe("player state", () => {
  it("only reports playing once the media element says so", () => {
    const requested = run([{ type: "requestPlay" }]);
    expect(requested.status).toBe("loading");
    expect(run([{ type: "playing" }], requested).status).toBe("playing");
  });

  it("treats a blocked play() as a recoverable notice, not a playing state", () => {
    const state = run([{ type: "requestPlay" }, { type: "playRejected", blocked: true }]);
    expect(state.status).toBe("paused");
    expect(state.error).toBe("blocked");
  });

  it("keeps the media error when play() also rejects", () => {
    const state = run([
      { type: "requestPlay" },
      { type: "mediaError", code: 4 },
      { type: "playRejected", blocked: false },
    ]);
    expect(state.status).toBe("error");
    expect(state.error).toBe("unavailable");
  });

  it("maps media error codes and ignores user aborts", () => {
    expect(run([{ type: "mediaError", code: 2 }]).error).toBe("network");
    expect(run([{ type: "mediaError", code: 3 }]).error).toBe("unavailable");
    expect(run([{ type: "mediaError", code: 1 }]).status).toBe("idle");
  });

  it("shows buffering only while the listener expects sound", () => {
    expect(run([{ type: "waiting" }]).buffering).toBe(false);
    const playing = run([{ type: "requestPlay" }, { type: "playing" }, { type: "waiting" }]);
    expect(playing.buffering).toBe(true);
    expect(run([{ type: "canplay" }], playing).buffering).toBe(false);
    expect(run([{ type: "playing" }], playing).buffering).toBe(false);
  });

  it("does not let a pause event hide an error or the ended state", () => {
    expect(run([{ type: "mediaError", code: 2 }, { type: "pause" }]).status).toBe("error");
    expect(run([{ type: "ended" }, { type: "pause" }]).status).toBe("ended");
  });

  it("leaves the ended state when the listener seeks back", () => {
    const state = run([{ type: "ended" }, { type: "seeking", currentTime: 120 }]);
    expect(state.status).toBe("paused");
    expect(state.currentTime).toBe(120);
  });

  it("ignores invalid durations from streams", () => {
    expect(run([{ type: "duration", duration: Number.NaN }]).duration).toBeUndefined();
    expect(
      run([{ type: "duration", duration: Number.POSITIVE_INFINITY }]).duration,
    ).toBeUndefined();
    expect(run([{ type: "duration", duration: 1338.5 }]).duration).toBe(1338.5);
  });

  it("clears the error on retry and keeps preferences on reset", () => {
    expect(run([{ type: "mediaError", code: 2 }, { type: "retry" }]).error).toBeUndefined();
    const reset = run([
      { type: "rate", rate: 1.5 },
      { type: "volume", volume: 0.4, muted: true },
      { type: "seeked", currentTime: 300 },
      { type: "reset" },
    ]);
    expect(reset).toMatchObject({ rate: 1.5, volume: 0.4, muted: true, currentTime: 0 });
  });
});

describe("mini-player", () => {
  it("shows only after playback started, while listening, with the main player out of view", () => {
    expect(shouldShowMiniPlayer({ started: true, playerVisible: false, mode: "listen" })).toBe(
      true,
    );
  });

  it("stays hidden before anything has played", () => {
    expect(shouldShowMiniPlayer({ started: false, playerVisible: false, mode: "listen" })).toBe(
      false,
    );
  });

  it("stays hidden while the main player is on screen or the video is selected", () => {
    expect(shouldShowMiniPlayer({ started: true, playerVisible: true, mode: "listen" })).toBe(
      false,
    );
    expect(shouldShowMiniPlayer({ started: true, playerVisible: false, mode: "watch" })).toBe(
      false,
    );
  });
});

describe("seeking", () => {
  it("prefers the media duration and falls back to the RSS estimate", () => {
    expect(effectiveDuration(1338.4, 1339)).toBe(1338.4);
    expect(effectiveDuration(Number.NaN, 1339)).toBe(1339);
    expect(effectiveDuration(Number.POSITIVE_INFINITY, undefined)).toBeUndefined();
    expect(effectiveDuration(0, 0)).toBeUndefined();
  });

  it("clamps to the episode", () => {
    expect(clampSeek(-15, 1339)).toBe(0);
    expect(clampSeek(1400, 1339)).toBe(1339);
    expect(clampSeek(582, 1339)).toBe(582);
    expect(clampSeek(582, undefined)).toBe(582);
    expect(clampSeek(Number.NaN, 1339)).toBe(0);
  });
});

describe("time formatting", () => {
  it("formats clock times", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(582.9)).toBe("9:42");
    expect(formatClock(3723)).toBe("1:02:03");
    expect(formatClock(undefined)).toBe("--:--");
    expect(formatClock(Number.NaN)).toBe("--:--");
  });

  it("formats spoken times for screen readers", () => {
    expect(formatSpokenTime(582)).toBe("9 minutes 42 seconds");
    expect(formatSpokenTime(3601)).toBe("1 hour 1 second");
    expect(formatSpokenTime(60)).toBe("1 minute");
    expect(formatSpokenTime(0)).toBe("0 seconds");
  });
});
