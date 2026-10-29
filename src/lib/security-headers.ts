/**
 * Security headers for the public site (spec §12.6), set in `next.config.ts`.
 *
 * The Content Security Policy is fixed, not nonce-based: a nonce forces every page to render per
 * request, which would undo the prerendered pages and partial prefetching this site relies on
 * (see node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md). The cost is
 * `'unsafe-inline'` for the inline scripts and styles Next.js writes into each page; everything
 * else is limited to the exact services the site uses. A future `/admin` area (Phase 8) renders
 * per request anyway, so it can get its own stricter, nonce-based policy.
 *
 * Adding a third-party service? Allow its host here, or it will be silently blocked.
 */

/** Episode audio: the feed's URL on app.fusebox.fm redirects to the file on podcasts.fusebox.fm. */
export const AUDIO_HOSTS = ["https://app.fusebox.fm", "https://podcasts.fusebox.fm"] as const;

/** Iframes loaded only after a click: the YouTube player and the guest application form. */
export const FRAME_HOSTS = ["https://www.youtube-nocookie.com", "https://docs.google.com"] as const;

export function contentSecurityPolicy({ dev = false } = {}): string {
  return [
    "default-src 'self'",
    // Development only: React uses eval for its error overlay, and HMR talks over a websocket.
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    // data:/blob: for next/image blur placeholders; every image is served from this site.
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `media-src 'self' ${AUDIO_HOSTS.join(" ")}`,
    `connect-src 'self'${dev ? " ws: wss:" : ""}`,
    `frame-src ${FRAME_HOSTS.join(" ")}`,
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

export function securityHeaders({ dev = false } = {}): { key: string; value: string }[] {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy({ dev }) },
    // Two years. No `includeSubDomains`/`preload` yet: preload is hard to undo.
    { key: "Strict-Transport-Security", value: "max-age=63072000" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    // For browsers that don't read CSP's frame-ancestors.
    { key: "X-Frame-Options", value: "DENY" },
    // Features the site never uses. Clipboard, Web Share, fullscreen and picture-in-picture
    // (YouTube) are left alone.
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
    },
  ];
}
