import { episodeSchema, slugSchema } from "./schema";
import type { Episode, SourceEpisode } from "./types";

export class EpisodeInventoryError extends Error {
  constructor(readonly problems: string[]) {
    super(`Episode inventory is invalid:\n- ${problems.join("\n- ")}`);
    this.name = "EpisodeInventoryError";
  }
}

/**
 * Attaches reviewed slugs to source episodes. Fails loudly rather than inventing a slug,
 * so a new feed item can't go live until someone assigns its permanent URL.
 */
export function buildEpisodeInventory(
  episodes: SourceEpisode[],
  slugsByGuid: Readonly<Record<string, string>>,
): Episode[] {
  const problems: string[] = [];
  const guidsBySlug = new Map<string, string>();

  for (const [guid, slug] of Object.entries(slugsByGuid)) {
    if (!slugSchema.safeParse(slug).success) problems.push(`Invalid slug "${slug}" for ${guid}.`);
    const existing = guidsBySlug.get(slug);
    if (existing) problems.push(`Slug "${slug}" is assigned to both ${existing} and ${guid}.`);
    guidsBySlug.set(slug, guid);
  }

  const inventory = episodes.flatMap((episode) => {
    const slug = slugsByGuid[episode.sourceGuid];
    if (!slug) {
      problems.push(
        `No slug assigned for ${episode.sourceGuid} (episode ${episode.episodeNumber ?? "?"}: "${episode.title}").`,
      );
      return [];
    }
    const result = episodeSchema.safeParse({ ...episode, slug });
    if (!result.success) {
      problems.push(`${episode.sourceGuid} failed validation: ${result.error.message}`);
      return [];
    }
    return [result.data];
  });

  if (problems.length > 0) throw new EpisodeInventoryError(problems);
  return inventory;
}
