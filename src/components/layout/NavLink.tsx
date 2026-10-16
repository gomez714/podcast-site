"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

/** Marks the link for the current route with aria-current="page". Hash links never count as current. */
export function NavLink({ href, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const pathname = usePathname();
  const isCurrent = !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));

  return <Link href={href} aria-current={isCurrent ? "page" : undefined} {...props} />;
}
