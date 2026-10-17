import type { EpisodeEditorial } from "@/lib/episodes/types";

/**
 * Reviewed editorial content for every published episode, joined to the RSS snapshot by slug
 * (spec §6.4–6.5). A feed sync never touches this file.
 *
 * - Summaries and topics are written only from each episode's published show notes.
 * - `youtubeId` is the filmed conversation on the show's channel. Episodes 1 and 8 only have an
 *   audio-with-cover-art upload, so they are audio-only. Episode 8 was filmed but never uploaded;
 *   add its ID here if it goes up. Never guess an ID from a title.
 * - `contentNote` is only for subjects the host has approved flagging.
 * - Set `reviewStatus: "reviewed"` once the host has checked the guest name, summary, topics,
 *   video and thumbnail.
 */
export const episodeEditorial: EpisodeEditorial[] = [
  {
    slug: "ep-1-luis-gomez",
    guestName: "Luis Gomez",
    summary:
      "Luis introduces the show: the Johari window idea behind its name, his path from performing artist to software developer, and why he wanted to share extraordinary stories from ordinary lives.",
    topics: ["Johari window", "Career change", "Performing arts", "Software development"],
    reviewStatus: "draft",
  },
  {
    slug: "ep-2-razie",
    guestName: "Razie",
    summary:
      "Razie, a life coach known as the “Lady Boss,” on her journey from Iran to coaching women around the world, and why self-confidence and community sit at the heart of her work.",
    topics: ["Women's empowerment", "Self-confidence", "Coaching", "Moving countries"],
    youtubeId: "rZYuHvRtIfs",
    reviewStatus: "draft",
  },
  {
    slug: "ep-3-simon-guerard",
    guestName: "Simon Guerard",
    summary:
      "A French Canadian scientist and trail runner on going from weekend hikes to ultra-marathons, what the running community gave him, and what long races taught him about limits.",
    topics: ["Ultra-marathons", "Running community", "Science and medicine"],
    youtubeId: "6V13XHmXtB0",
    reviewStatus: "draft",
  },
  {
    slug: "ep-4-kate-conwell",
    guestName: "Kate Conwell",
    summary:
      "Kate Conwell, founder of Journey Beyond Betrayal, talks about healing after marital infidelity, the role of faith, and building a place where other women can find support.",
    topics: ["Healing", "Infidelity", "Faith", "Supporting women"],
    contentNote: "Discusses marital infidelity and betrayal.",
    youtubeId: "oB3d_5n_78g",
    reviewStatus: "draft",
  },
  {
    slug: "ep-5-devin",
    guestName: "Devin Wagner",
    summary:
      "Devin Wagner on ultra-marathons, podcasting, fatherhood and yerba mate, and an open conversation about his path to sobriety and choosing to live more authentically.",
    topics: ["Yerba mate", "Sobriety", "Ultra-marathons", "Podcasting"],
    contentNote: "Discusses addiction and recovery.",
    youtubeId: "xMEMoh62Yo0",
    reviewStatus: "draft",
  },
  {
    slug: "ep-6-jurate-wolfe",
    guestName: "Jurate Wolfe",
    summary:
      "From Lithuania to the Kennedy Space Center: Jurate talks about human factors work on space missions, being a woman in STEM, and where science and astrology meet in her life.",
    topics: ["Space science", "Women in STEM", "Astrology"],
    youtubeId: "dtiLIAXVPUU",
    reviewStatus: "draft",
  },
  {
    slug: "ep-7-alekson",
    guestName: "Alekson Fortes",
    summary:
      "Alekson on leaving Brazil for a tech career in Canada: learning French in Quebec, cultural differences, setbacks, and his mission to help other Brazilians build careers abroad.",
    topics: ["Technology careers", "Moving countries", "Self-development"],
    youtubeId: "C8f4mPhpIb8",
    reviewStatus: "draft",
  },
  {
    slug: "ep-8-yuko-sasaki",
    guestName: "Yuko Sasaki",
    summary:
      "Yuko left Tokyo for the United States looking for a life with fewer rules. She talks about culture shock, building a career in restaurants, and wanting to inspire women in Japan.",
    topics: ["Moving countries", "Culture shock", "Work-life balance", "Authenticity"],
    reviewStatus: "draft",
  },
];

/**
 * Homepage "Featured conversations" (spec §5.1), in display order. Chosen by the host as the three
 * most-listened-to episodes.
 */
export const featuredEpisodeSlugs = ["ep-3-simon-guerard", "ep-6-jurate-wolfe", "ep-8-yuko-sasaki"];
