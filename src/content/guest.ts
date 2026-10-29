/**
 * "Be a guest" page copy, written by the host (Oct 28, 2026). Kept word for word; the page only
 * arranges it. The facts in `atAGlance` repeat what the sections below say, for scanning.
 */
export const guestPage = {
  title: "Everyone has something worth talking about.",
  prompts: [
    "Have a story you'd like to share?",
    "A perspective you wish more people understood?",
    "A passion you could talk about for hours?",
  ],
  invitation: "I'd love to hear about it.",
  intro: [
    "I'm Luis Gomez, host of The Bottom Left Pane, a conversational podcast about people, their experiences, and all the interesting things that make us who we are.",
    "There's no one subject that defines the show. Sometimes the conversations are funny and lighthearted. Other times they're personal, thoughtful, or a little more serious. And sometimes we end up somewhere neither of us expected.",
    "That's part of what I enjoy about it.",
    "I'm always interested in meeting new people and hearing about things I might not have encountered otherwise.",
  ],
  atAGlance: [
    { term: "Length", detail: "Around 30–60 minutes" },
    { term: "Where", detail: "Remotely, using Riverside" },
    { term: "Format", detail: "Video and audio preferred; audio-only is possible" },
    { term: "Pay", detail: "Voluntary and unpaid, with credit in your episode description" },
    { term: "Age", detail: "18 or older" },
  ],
} as const;

export type GuestTopic = {
  /** Unique on the page; prefixed so it can't clash with another kept-alive page. */
  id: string;
  question: string;
  /** Shown first, in bold. */
  lead?: string;
  paragraphs: readonly string[];
  list?: readonly string[];
  /** Paragraphs after the list. */
  after?: readonly string[];
  /** A sentence to stand out from the rest, shown last. */
  note?: string;
};

/** The conversation itself: who, what it's like and how it's recorded. */
export const conversationTopics: readonly GuestTopic[] = [
  {
    id: "guest-who",
    question: "Who can be a guest?",
    paragraphs: [
      "Pretty much anyone who's interested in having a genuine conversation!",
      "You don't need to be famous, have a social media following, or have appeared on a podcast before.",
      "Maybe you have an unusual hobby, an experience that stuck with you, an interesting outlook on life, or something you're genuinely passionate about.",
      "And don't worry if you don't think your story is particularly extraordinary. Sometimes the things we consider ordinary about ourselves are the things other people find most fascinating.",
    ],
    note: "Guests must be at least 18 years old.",
  },
  {
    id: "guest-expect",
    question: "What to expect",
    lead: "A relaxed, unscripted conversation.",
    paragraphs: [
      "Our interviews typically last around 30–60 minutes. We'll discuss the general subject beforehand so neither of us is walking in completely blind, but I don't expect you to prepare a speech or memorize answers.",
      "I might have some questions ready, but I'm much more interested in allowing the conversation to develop naturally.",
      "There's no pressure to share anything you're uncomfortable discussing. We can establish boundaries ahead of time, and you're always welcome to ask for a pause or break.",
      "My goal is to create an environment where you feel comfortable being yourself.",
    ],
  },
  {
    id: "guest-recording",
    question: "How do we record?",
    paragraphs: [
      "Interviews are conducted remotely using Riverside.",
      "I prefer to record with both video and audio. Being able to see each other makes the conversation feel more natural, and full video episodes are part of the podcast's planned release format.",
      "Audio-only interviews are also possible, although I generally prioritize guests who are comfortable appearing on camera.",
      "You don't need a professional recording studio. A quiet environment, a reasonably clear microphone, a stable internet connection, and a webcam if you're participating on video are generally enough.",
      "We'll coordinate the technical details before the interview.",
    ],
  },
];

/** Publication, pay, consent and withdrawal. */
export const agreementTopics: readonly GuestTopic[] = [
  {
    id: "guest-publishing",
    question: "Where will the interview appear?",
    paragraphs: ["Depending on the agreed recording format, episodes may be published as:"],
    list: [
      "Full video episodes on YouTube and other video platforms.",
      "Audio episodes on podcast listening platforms.",
      "Short clips, highlights, and promotional content on the podcast's website and social media.",
    ],
    after: [
      "Your participation and the planned uses of your recording will be explained before the interview.",
    ],
    note: "We won't assume that agreeing to a video call automatically means agreeing to public video distribution.",
  },
  {
    id: "guest-pay",
    question: "Will I be paid?",
    paragraphs: [
      "Guest appearances are voluntary and unpaid.",
      "You'll receive credit in your episode description, and you're welcome to share relevant links to your website, social media, portfolio, or creative projects.",
      "There's no expectation that you promote your appearance, although you're welcome to share the episode once it's released.",
    ],
  },
  {
    id: "guest-before",
    question: "What happens before recording?",
    paragraphs: [
      "If we're considering an interview, we'll discuss the topic, recording format, scheduling, and any boundaries you might have.",
      "Before we record, I'll also share a guest appearance agreement explaining how the recording can be edited, published, and promoted.",
      "You're welcome to ask questions about anything in the agreement before signing.",
    ],
  },
  {
    id: "guest-change-mind",
    question: "What if I change my mind?",
    paragraphs: [
      "Before recording, you can decide not to participate.",
      "During the interview, you're welcome to request a pause or end the conversation.",
      "If something concerns you after recording, please contact me as soon as possible. I'm happy to discuss reasonable requests involving sensitive information, privacy, or unintended disclosures.",
      "However, interviews are not automatically subject to guest editorial approval, and once content has been published, complete removal from every platform or third-party copy may not be possible.",
    ],
    note: "The guest agreement provides the formal terms governing publication and withdrawal.",
  },
];

export const guestInquiry = {
  heading: "Interested in joining the conversation?",
  paragraphs: [
    "I'd love to hear from you!",
    "Send me an email introducing yourself and telling me a little about what you'd be interested in discussing.",
    "It doesn't need to be a formal pitch. Just tell me who you are, what's on your mind, and why you'd like to have the conversation.",
  ],
  subject: "The Bottom Left Pane — Guest Inquiry",
  privacyNote: "Please avoid including sensitive personal information in your initial email.",
} as const;

export const guestReferral = {
  heading: "Know someone else with a story worth sharing?",
  paragraphs: [
    "Maybe appearing on a podcast isn't your thing, but you know somebody who'd be perfect for a conversation.",
    "Feel free to send them this page!",
    "They don't have to be a creator, public figure, or experienced speaker. I'm always interested in meeting people I wouldn't otherwise have the opportunity to talk to.",
  ],
  closing: "Sometimes all it takes is a conversation to discover something interesting.",
} as const;
