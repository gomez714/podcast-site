import { NextResponse, type NextRequest } from "next/server";

import { episodeSlugsByGuid } from "@/content/episode-slugs";

const knownSlugs = new Set(Object.values(episodeSlugsByGuid));

/**
 * The episode page streams from a Suspense boundary, so a `notFound()` there can only send a
 * 200 with `noindex`. Rejecting unknown slugs here, before rendering, keeps a real 404 status.
 */
export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2];
  if (slug && !knownSlugs.has(decodeURIComponent(slug))) {
    // `_`-prefixed paths can never match an App Router route, so this renders `not-found.tsx`.
    return NextResponse.rewrite(new URL("/_episode-not-found", request.url));
  }
}

export const config = {
  matcher: "/episodes/:slug",
};
