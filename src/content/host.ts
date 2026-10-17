/**
 * The host's introduction, written by the host (spec §5.1 item 6, §5.4). The homepage shows the
 * teaser; the About page shows the full introduction.
 */
export const hostIntro = {
  teaser:
    "I'm a storyteller, a lifelong performer, a software engineer, a voice actor, and someone who's endlessly curious about people. My path from dance to software engineering hasn't exactly been a straight line, and it's taught me how much there is to a person beyond the chapter of their life you happen to encounter. I started The Bottom Left Pane to sit down with people and see where genuine curiosity takes us.",
  about: [
    "I'm a storyteller, a lifelong performer, a software engineer, a voice actor, and, most importantly for this show, someone who's endlessly curious about people.",
    "I earned my BFA in Dance from the University of California, Santa Barbara. Dance taught me how to communicate without words, collaborate with people from different backgrounds, and understand just how powerful storytelling can be. Eventually my path took an unexpected turn into software engineering. On paper they're different worlds, but both involve curiosity, experimentation, and trying to understand how people experience the world around them.",
    "These days I work in technology, pursue voice acting, and follow anything that sends me down an interesting rabbit hole: gaming, film, animation, music, science, travel. And if I meet someone who's passionate about something I know absolutely nothing about? Even better.",
  ],
  why: [
    "Every person we meet has lived an entire life we know almost nothing about. Some of the most memorable conversations I've had began with something completely ordinary and revealed a side of someone I never would have expected. I started The Bottom Left Pane to create more of those moments. That doesn't mean rigid interviews or perfectly packaged answers. It means sitting down with people and seeing where genuine curiosity takes us.",
    "There's a difference between interviewing someone and actually being curious about them. I'm not looking to agree with every guest, and I don't expect them to agree with me. What matters is that we're willing to listen and engage with genuine interest.",
    "I don't host this podcast because I have all the answers. Quite the opposite. I host it because I enjoy learning from people, and I hope that curiosity is contagious.",
  ],
  signOff: {
    emphasis: "Sometimes all it takes is asking the right question.",
    welcome: ["Welcome to The Bottom Left Pane.", "I'm glad you're here."],
  },
} as const;
