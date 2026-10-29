"use client";

import { Tabs } from "@base-ui/react/tabs";
import type { ReactNode } from "react";

export type EpisodeDetailTab = { value: string; label: ReactNode; content: ReactNode };

/**
 * About / Chapters / Transcript switch; the first tab is selected. Every panel stays in the HTML
 * so the hidden ones are still indexable.
 */
export function EpisodeDetailTabs({ tabs }: { tabs: readonly EpisodeDetailTab[] }) {
  return (
    <Tabs.Root defaultValue={tabs[0]?.value}>
      <Tabs.List
        aria-label="Episode details"
        className="mb-8 inline-flex flex-wrap gap-1 rounded-full border border-line-light p-1"
      >
        {tabs.map((tab) => (
          <Tabs.Tab key={tab.value} value={tab.value} className="section-tab">
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {tabs.map((tab) => (
        <Tabs.Panel key={tab.value} value={tab.value} keepMounted>
          {tab.content}
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  );
}
