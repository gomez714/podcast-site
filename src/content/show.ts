/**
 * Show copy written by the host (spec §5.1 item 2, §5.4), shared by the homepage's About section
 * and the About page so the two never drift apart.
 */
export const showPremise = {
  tagline: ["Everyone has a story.", "Not everyone gets asked about it."],
  intro:
    "We meet people, form impressions, and start to believe we know who they are. But there's always more beneath the surface: an experience that changed the way someone sees the world, a passion they've quietly pursued for years, a lesson they've learned. Sometimes those stories stay untold because they're deeply personal. Other times, no one ever thought to ask.",
  name: "The name comes from the Johari window, a model of self-awareness and how we relate to others. Its bottom left pane is the hidden self: the things we know about ourselves that others don't.",
  closing:
    "This isn't a show about exposing secrets or digging up dirt. It's about curiosity, connection, and taking a genuine interest in another person's story.",
} as const;

/** The host's take on the hidden pane, after the general Johari background on the About page. */
export const hiddenPane = [
  "One of those panes is the hidden self: the things we know about ourselves that others don't. I've always been drawn to that idea. Think about how much of someone's life exists beyond what we see: the experiences that shaped them, the interests that define them, the little details that make them uniquely themselves. Some of those things are kept private on purpose. Others just haven't found their way into a conversation.",
  "The Bottom Left Pane is my attempt to make room for those conversations.",
] as const;

/** "What to expect" on the About page: honest about the show without promising confessions. */
export const expectations = {
  points: [
    {
      title: "Curiosity, not confessions.",
      body: "This isn't about exposing secrets or getting someone to reveal something they aren't comfortable sharing. It's about taking a genuine interest in another person's story.",
    },
    {
      title: "No set destination.",
      body: "A conversation might begin with someone's career, travels, or creative pursuits and end up somewhere neither of us expected. Sometimes the best moments come from the questions we didn't know we were going to ask.",
    },
    {
      title: "Everyone has a story.",
      body: "You don't need to be famous, or to have overcome some monumental challenge, to have something worth sharing. Some of the most compelling conversations come from everyday experiences and unexpected perspectives.",
    },
  ],
  closing:
    "Sometimes we'll get philosophical. Sometimes we'll laugh about something ridiculous. And sometimes we'll simply have a really good conversation.",
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
