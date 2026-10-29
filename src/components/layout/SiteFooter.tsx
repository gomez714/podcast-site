import Link from "next/link";

import { CopyLink } from "@/components/ui/copy-link";
import { ExternalLink } from "@/components/ui/external-link";
import { ANALYTICS_EVENTS, trackClicks } from "@/lib/analytics";
import { mainNav, platformLinks, secondaryNav, siteConfig } from "@/lib/site";

import { Container } from "./Container";
import { SiteLogo } from "./SiteLogo";

async function CopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}

/** Outlined pill matching the header's "Find the show" call to action. */
const platformLinkClass =
  "inline-flex min-h-11 items-center gap-2 rounded-md border border-ice px-3.5 text-xs font-bold whitespace-nowrap text-ice hover:bg-white/8";

const footerLinkClass =
  "inline-flex min-h-11 items-center gap-1.5 underline-offset-4 hover:text-white hover:underline";

export function SiteFooter() {
  return (
    <footer id="listen" className="border-t border-line-dark surface-dark">
      <Container className="flex flex-col gap-6 py-10 md:py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <SiteLogo />

        <section aria-labelledby="footer-listen" className="lg:max-w-152">
          <h2 id="footer-listen" className="eyebrow text-ice">
            Find the show
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2.5">
            {platformLinks.map((platform) => (
              <li key={platform.href}>
                <ExternalLink
                  href={platform.href}
                  className={platformLinkClass}
                  {...trackClicks(ANALYTICS_EVENTS.platformClick, {
                    platform: platform.label,
                    placement: "Footer",
                  })}
                >
                  {platform.label}
                </ExternalLink>
              </li>
            ))}
            <li
              {...trackClicks(ANALYTICS_EVENTS.platformClick, {
                platform: "RSS feed",
                placement: "Footer",
              })}
            >
              {/* Copied, not opened: the feed is only useful pasted into a podcast app, and opening it shows raw XML. */}
              <CopyLink
                href={siteConfig.rssUrl}
                label="Copy RSS feed"
                copiedLabel="Feed link copied"
                announcement="RSS feed link copied. Paste it into your podcast app to follow the show."
                className={platformLinkClass}
              />
            </li>
          </ul>
        </section>
      </Container>

      <Container className="flex flex-col gap-1 border-t border-line-dark py-4 text-xs text-ice md:flex-row md:items-center md:justify-between md:gap-6">
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 font-semibold">
            {[...mainNav, ...secondaryNav].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={footerLinkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center justify-between gap-6">
          <p>
            © <CopyrightYear /> {siteConfig.name}
          </p>
          <a href="#top" className={footerLinkClass}>
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>
      </Container>
    </footer>
  );
}
