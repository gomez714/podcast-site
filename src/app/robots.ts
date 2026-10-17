import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/structured-data";

/** Everything public is crawlable; the sitemap lists every page (spec §11, Phase 6). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
