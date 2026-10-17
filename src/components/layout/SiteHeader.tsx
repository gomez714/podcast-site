import { followNavItem, mainNav } from "@/lib/site";

import { Container } from "./Container";
import { HeaderReveal } from "./HeaderReveal";
import { MobileMenu } from "./MobileMenu";
import { NavLink } from "./NavLink";
import { SiteLogo } from "./SiteLogo";

export function SiteHeader() {
  return (
    // No id="top" here: the header is sticky, so "#top" links rely on the HTML default instead
    // (a "#top" fragment with no matching element scrolls to the top of the document).
    <HeaderReveal className="border-b border-line-dark surface-dark">
      <Container className="flex h-[71px] items-center justify-between gap-6 md:h-[88px]">
        <SiteLogo />

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-[clamp(1rem,2.2vw,1.875rem)] text-xs font-bold whitespace-nowrap">
            {mainNav.map((item) => (
              <li key={item.href}>
                <NavLink
                  href={item.href}
                  className="inline-flex min-h-11 items-center hover:text-ice aria-[current=page]:text-ice aria-[current=page]:underline aria-[current=page]:underline-offset-8"
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              {/* A same-page jump to the footer, so it never leaves the page (or stops its audio). */}
              <a
                href={followNavItem.href}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-ice px-3.5 text-ice hover:bg-white/8 lg:px-[18px]"
              >
                {followNavItem.label}
                <span aria-hidden="true">↓</span>
              </a>
            </li>
          </ul>
        </nav>

        <div className="md:hidden">
          <MobileMenu />
        </div>
      </Container>
    </HeaderReveal>
  );
}
