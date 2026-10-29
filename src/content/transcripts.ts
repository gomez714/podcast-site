/**
 * Host-approved edits to the automatic Fusebox transcripts (Oct 28, 2026), applied whenever a page
 * renders, so `npm run sync:transcripts` never overwrites them.
 *
 * - `speakers` maps each raw transcript label to the first name shown. Every label in an episode's
 *   transcript must be listed, or the build fails.
 * - `corrections` are exact find-and-replace pairs for names and show terms only. Each must still
 *   match at least once, or the build fails (so a re-synced transcript can't silently skip one).
 *   They are deliberately narrow phrases: "the bottom left pane" stays lowercase where it means the
 *   Johari quadrant, and "Yuki… or Yuko, I'm sorry" (ep 8) is left as it was said.
 */
export type TranscriptEdits = {
  speakers: Readonly<Record<string, string>>;
  corrections?: readonly (readonly [from: string, to: string])[];
};

/** The host's name as shown in transcripts; styled apart from guests. */
export const transcriptHostName = "Luis";

export const transcriptEdits: Readonly<Record<string, TranscriptEdits>> = {
  "ep-1-luis-gomez": {
    // Solo episode: the transcript has no speaker labels.
    speakers: {},
    corrections: [
      ["jihari window", "Johari window"],
      ["the johari window model", "the Johari window model"],
      ["this is the bottom left pain,", "this is The Bottom Left Pane,"],
      ["episode of The bottom left pane", "episode of The Bottom Left Pane"],
      ["called the bottom left pane And", "called The Bottom Left Pane And"],
      ["So that's the bottom left pain.", "So that's the bottom left pane."],
      ["the fourth pain", "the fourth pane"],
      ["why it's called the bottom left pane", "why it's called The Bottom Left Pane"],
      ["engage with the bottom left pane", "engage with The Bottom Left Pane"],
    ],
  },
  "ep-2-razie": {
    speakers: { Luis: "Luis", "Razie Ladyboss": "Razie" },
  },
  "ep-3-simon-guerard": {
    speakers: { Luis: "Luis", "Simon Guerard": "Simon" },
  },
  "ep-4-kate-conwell": {
    speakers: { Luis: "Luis", "Kate Conwell": "Kate" },
  },
  "ep-5-devin": {
    speakers: { "Luis Gomez": "Luis", "Devin Wagener": "Devin" },
    corrections: [
      ["jihari window", "Johari window"],
      ["This is The bottom left pain.", "This is The Bottom Left Pane."],
      ["welcome to the bottom left pain,", "welcome to The Bottom Left Pane,"],
      ["tuning in to the Bottom Left Pane", "tuning in to The Bottom Left Pane"],
    ],
  },
  "ep-6-jurate-wolfe": {
    speakers: { "Luis Gomez": "Luis", "Jurate Wolfe": "Jurate" },
    corrections: [
      ["episode of the Bottom Left Pane", "episode of The Bottom Left Pane"],
      ["we have Urate here", "we have Jurate here"],
    ],
  },
  "ep-7-alekson": {
    speakers: { Luis: "Luis", Alekson: "Alekson" },
    corrections: [
      ["we have Alexan,", "we have Alekson,"],
      ["amazing, Alexan.", "amazing, Alekson."],
    ],
  },
  "ep-8-yuko-sasaki": {
    speakers: { Luis: "Luis", yuko: "Yuko" },
    corrections: [["your time, Louis.", "your time, Luis."]],
  },
};
