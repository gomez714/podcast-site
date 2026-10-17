"use client";

import { cn } from "cn";
import { ChevronDown } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

type ShowMoreListProps = {
  items: { key: string | number; content: ReactNode }[];
  /** How many stay visible while collapsed. */
  visible: number;
  /** Plural noun for the button, e.g. "chapters". */
  noun: string;
  ordered?: boolean;
  className?: string;
};

/**
 * A list that shows its first few items with a "Show all" toggle. Every item is in the HTML; the
 * rest are only `hidden`, so they stay indexable and nothing shifts until someone asks for them.
 */
export function ShowMoreList({ items, visible, noun, ordered, className }: ShowMoreListProps) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const List = ordered ? "ol" : "ul";
  const collapsible = items.length > visible + 1;

  return (
    <>
      <List id={id} className={className}>
        {items.map((item, i) => (
          <li key={item.key} hidden={collapsible && !expanded && i >= visible}>
            {item.content}
          </li>
        ))}
      </List>
      {collapsible && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((open) => !open)}
          className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-navy underline decoration-ice decoration-2 underline-offset-[6px] hover:decoration-navy"
        >
          {expanded ? `Show fewer ${noun}` : `Show all ${items.length} ${noun}`}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-4 transition-transform motion-reduce:transition-none",
              expanded && "rotate-180",
            )}
          />
        </button>
      )}
    </>
  );
}
