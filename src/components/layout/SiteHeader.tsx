import { followNavItem, mainNav } from "@/lib/site";

import { Container } from "./Container";
import { MobileMenu } from "./MobileMenu";
import { NavLink } from "./NavLink";
import { SiteLogo } from "./SiteLogo";

export function SiteHeader() {
  return (
    <header id="top" className="relative z-10 border-b border-line-dark surface-dark">
      <Container className="flex h-[71px] items-center justify-between gap-6 md:h-[88px]">
        <SiteLogo />

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-[clamp(1.25rem,2.5vw,1.875rem)] text-xs font-bold">
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
              <NavLink
                href={followNavItem.href}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-ice px-[18px] text-ice hover:bg-white/8"
              >
                {followNavItem.label}
                <span aria-hidden="true">↗</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="md:hidden">
          <MobileMenu />
        </div>
      </Container>
    </header>
  );
}
