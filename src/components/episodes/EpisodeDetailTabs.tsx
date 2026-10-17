"use client";

import { Tabs } from "@base-ui/react/tabs";
import type { ReactNode } from "react";

/** About / Chapters switch. Both panels stay in the HTML so the hidden one is still indexable. */
export function EpisodeDetailTabs({
  about,
  chapters,
  chapterCount,
}: {
  about: ReactNode;
  chapters: ReactNode;
  chapterCount: number;
}) {
  return (
    <Tabs.Root defaultValue="about">
      <Tabs.List
        aria-label="Episode details"
        className="mb-8 inline-flex gap-1 rounded-full border border-line-light p-1"
      >
        <Tabs.Tab value="about" className="section-tab">
          About
        </Tabs.Tab>
        <Tabs.Tab value="chapters" className="section-tab">
          {/* Full colour, not faded: the count must meet 4.5:1 contrast like the label. */}
          Chapters <span className="font-semibold">({chapterCount})</span>
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="about" keepMounted>
        {about}
      </Tabs.Panel>
      <Tabs.Panel value="chapters" keepMounted>
        {chapters}
      </Tabs.Panel>
    </Tabs.Root>
  );
}
