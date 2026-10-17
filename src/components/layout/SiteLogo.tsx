import Link from "next/link";

import { siteConfig } from "@/lib/site";

/** V5 wordmark: four-pane mark (bottom-left pane highlighted) beside the show name and tagline. */
export function SiteLogo() {
  return (
    <Link href="/" className="flex min-h-11 items-center gap-3 leading-none">
      <span
        aria-hidden="true"
        className="grid shrink-0 grid-cols-[10px_10px] grid-rows-[10px_10px] gap-[3px]"
      >
        <span className="bg-ice" />
        <span className="bg-ice" />
        <span className="bg-sky" />
        <span className="bg-ice" />
      </span>
      <span className="flex flex-col">
        <span className="font-display text-[15px] font-extrabold tracking-[0.075em] uppercase min-[391px]:text-lg md:text-[22px]">
          {siteConfig.name}
        </span>
        <span className="mt-1 hidden text-[9px] font-semibold tracking-[0.16em] whitespace-nowrap text-ice uppercase sm:block md:text-[11px] md:tracking-[0.23em]">
          {siteConfig.tagline}
        </span>
      </span>
    </Link>
  );
}
