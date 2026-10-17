/**
 * Approved show copy (spec §5.1 item 2, §5.4), shared by the homepage's About section and the
 * About page so the two never drift apart.
 */
export const showPremise = {
  intro:
    "The Bottom Left Pane is built around the stories, perspectives, and experiences we keep to ourselves. Every conversation is a chance to listen a little closer, get curious, and discover something we might otherwise never see.",
  name: "The name comes from the Johari window, a simple model of how we see ourselves and how others see us. Its bottom left pane holds what we know about ourselves but rarely share.",
  closing:
    "Not every story needs a dramatic reveal. Sometimes, the most interesting thing is simply making room for a real conversation.",
} as const;

/**
 * The four panes of the Johari window (Joseph Luft and Harrington Ingham, 1955), in reading order:
 * top row, then bottom row. The bottom-left "hidden" pane is the one the show is named after.
 */
export const johariPanes = [
  { name: "Open", description: "Known to you and to others" },
  { name: "Blind", description: "Known to others, not to you" },
  { name: "Hidden", description: "Known to you, not to others", isShowPane: true },
  { name: "Unknown", description: "Not yet known to anyone" },
] as const;
