import { cn } from "cn";
import Link from "next/link";

import { transcriptPreview, type TranscriptViewTurn } from "@/lib/episodes/transcripts";
import { countWords } from "@/lib/transcripts/parse";

/** Replies this short ("Mm-hmm.", "Oh, okay.") are set quieter so the conversation reads through. */
const BRIEF_WORDS = 3;

const wordCount = new Intl.NumberFormat("en-US");

/** "about 7,200 words", rounded to the nearest hundred. */
export function transcriptLength(turns: readonly TranscriptViewTurn[]): string {
  return `about ${wordCount.format(Math.round(countWords(turns) / 100) * 100)} words`;
}

/**
 * Shown above every transcript (spec §12.4: transcripts are labelled for what they are). In the
 * episode page's tab it also links straight to the full transcript, so nobody has to scroll for it.
 */
export function TranscriptNote({ fullTranscriptHref }: { fullTranscriptHref?: string }) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-l-4 border-ice bg-pale/40 px-4 py-3 text-sm text-slate">
      <p>
        <strong className="font-extrabold text-navy">Automatic transcript.</strong> Names and some
        words may be wrong.
      </p>
      {fullTranscriptHref && (
        <Link
          href={fullTranscriptHref}
          className="inline-flex min-h-11 items-center gap-2 font-extrabold text-navy underline decoration-ice decoration-2 underline-offset-[6px] hover:decoration-navy"
        >
          Read the full transcript <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}

/**
 * The episode page's Transcript tab: the note and the opening of the conversation, fading into a
 * link to the full transcript page. Long transcripts (up to 11,000+ words) live on their own page
 * so the episode page stays short (host's choice, Oct 29, 2026).
 */
export function EpisodeTranscriptPreview({
  slug,
  turns,
}: {
  slug: string;
  turns: readonly TranscriptViewTurn[];
}) {
  const preview = transcriptPreview(turns);
  const href = `/episodes/${slug}/transcript`;

  return (
    <div className="max-w-[72ch]">
      <TranscriptNote fullTranscriptHref={href} />
      <div className="relative after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-28 after:bg-linear-to-b after:from-white/0 after:to-white">
        <TranscriptTurns turns={preview} />
      </div>
      <Link
        href={href}
        className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-navy underline decoration-ice decoration-2 underline-offset-[6px] hover:decoration-navy"
      >
        Read the full transcript ({transcriptLength(turns)}) <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

/**
 * Speaker turns (host's choice from a preview, Oct 28, 2026): names in a side column from `sm`,
 * stacked on phones; quieter short replies; no timestamps, because Fusebox's times don't match the
 * published audio (the Chapters tab seeks instead). Names and spelling fixes come from
 * `src/content/transcripts.ts`.
 */
export function TranscriptTurns({ turns }: { turns: readonly TranscriptViewTurn[] }) {
  return (
    <div className="grid gap-5">
      {turns.map((turn, i) => {
        const brief = turn.paragraphs.join(" ").split(/\s+/).length <= BRIEF_WORDS;
        return (
          <div
            key={i}
            className={cn(
              turn.speaker && "grid gap-1 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-5",
            )}
          >
            {turn.speaker && (
              <p
                className={cn(
                  "text-xs font-extrabold tracking-[0.08em] uppercase sm:pt-1",
                  turn.isHost ? "text-navy" : "text-slate",
                )}
              >
                {turn.speaker}
              </p>
            )}
            <div
              className={cn(
                "space-y-3",
                brief ? "text-sm text-slate" : "text-[15px] leading-[1.8] text-[#334d77]",
              )}
            >
              {turn.paragraphs.map((paragraph, j) => (
                <p key={j}>{paragraph}</p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
