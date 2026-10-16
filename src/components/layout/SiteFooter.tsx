import Link from "next/link";

import { mainNav, siteConfig } from "@/lib/site";

import { Container } from "./Container";
import { SiteLogo } from "./SiteLogo";

async function CopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}

const footerLinkClass =
  "inline-flex min-h-11 items-center underline-offset-4 hover:text-white hover:underline";

export function SiteFooter() {
  return (
    <footer id="listen" className="border-t border-line-dark surface-dark">
      <Container className="grid gap-12 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10">
        <div className="flex flex-col gap-5">
          <SiteLogo />
          <p className="max-w-sm text-sm leading-relaxed text-pale">{siteConfig.description}</p>
        </div>

        <section aria-labelledby="footer-listen">
          <h2 id="footer-listen" className="eyebrow text-ice">
            Find the show
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-pale">
            Follow in any podcast app using the show&apos;s RSS feed.
          </p>
          <ul className="mt-2 text-sm text-ice">
            <li>
              <a href={siteConfig.rssUrl} className={footerLinkClass}>
                Podcast RSS feed
              </a>
            </li>
          </ul>
        </section>

        <nav aria-labelledby="footer-explore">
          <h2 id="footer-explore" className="eyebrow text-ice">
            Explore
          </h2>
          <ul className="mt-2 text-sm text-ice">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={footerLinkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>

      <Container className="flex flex-wrap items-center justify-between gap-4 border-t border-line-dark py-6 text-xs text-ice">
        <p>
          © <CopyrightYear /> {siteConfig.name}
        </p>
        <a href="#top" className={footerLinkClass}>
          Back to top <span aria-hidden="true">↑</span>
        </a>
      </Container>
    </footer>
  );
}
