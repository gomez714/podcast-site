import { describe, expect, it } from "vitest";

import { getAllEpisodes } from "@/lib/episodes/repository";
import { contentSecurityPolicy, securityHeaders } from "@/lib/security-headers";
import { guestApplicationForm } from "@/lib/site";

const directive = (policy: string, name: string) =>
  policy
    .split("; ")
    .find((part) => part.startsWith(`${name} `))
    ?.split(" ")
    .slice(1) ?? [];

describe("content security policy", () => {
  const policy = contentSecurityPolicy();

  it("allows the hosts the site actually loads from", () => {
    const media = directive(policy, "media-src");
    for (const episode of getAllEpisodes()) {
      expect(media, episode.slug).toContain(new URL(episode.audioUrl).origin);
    }
    expect(media).toContain("https://podcasts.fusebox.fm");

    const frames = directive(policy, "frame-src");
    expect(frames).toContain(new URL(guestApplicationForm.embedUrl).origin);
    expect(frames).toContain("https://www.youtube-nocookie.com");
  });

  it("locks down framing, plugins and base URLs", () => {
    expect(directive(policy, "frame-ancestors")).toEqual(["'none'"]);
    expect(directive(policy, "object-src")).toEqual(["'none'"]);
    expect(directive(policy, "base-uri")).toEqual(["'self'"]);
  });

  it("only allows eval and websockets in development", () => {
    expect(directive(policy, "script-src")).not.toContain("'unsafe-eval'");
    // Analytics and Speed Insights load from this site in production; only dev uses the CDN.
    expect(directive(policy, "script-src")).toEqual(["'self'", "'unsafe-inline'"]);
    expect(directive(policy, "connect-src")).toEqual(["'self'"]);
    const dev = contentSecurityPolicy({ dev: true });
    expect(directive(dev, "script-src")).toContain("'unsafe-eval'");
    expect(directive(dev, "connect-src")).toContain("ws:");
  });
});

describe("security headers", () => {
  it("sets each header once", () => {
    const keys = securityHeaders().map((header) => header.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toEqual(
      expect.arrayContaining([
        "Content-Security-Policy",
        "Strict-Transport-Security",
        "X-Content-Type-Options",
        "Referrer-Policy",
        "X-Frame-Options",
        "Permissions-Policy",
      ]),
    );
  });
});
