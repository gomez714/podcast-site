import type { NextConfig } from "next";

import { securityHeaders } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders({ dev: process.env.NODE_ENV === "development" }),
      },
    ];
  },
};

export default nextConfig;
