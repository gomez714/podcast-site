"use client";

import { MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { followNavItem, mainNav } from "@/lib/site";

import { NavLink } from "./NavLink";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-touch"
            className="text-white hover:bg-white/10 hover:text-white"
          />
        }
      >
        <MenuIcon aria-hidden="true" />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full border-line-dark surface-dark bg-navy p-0 text-white data-[side=right]:w-full data-[side=right]:sm:max-w-sm"
      >
        <div className="flex h-[71px] items-center justify-between border-b border-line-dark px-5">
          <SheetTitle className="font-sans eyebrow text-ice">Menu</SheetTitle>
          <SheetClose
            render={
              <Button
                variant="ghost"
                size="icon-touch"
                className="text-white hover:bg-white/10 hover:text-white"
              />
            }
          >
            <XIcon aria-hidden="true" />
            <span className="sr-only">Close menu</span>
          </SheetClose>
        </div>
        <SheetDescription className="sr-only">Site navigation</SheetDescription>

        <nav aria-label="Main" className="px-5 py-6">
          <ul className="flex flex-col">
            {mainNav.map((item) => (
              <li key={item.href} className="border-b border-line-dark">
                <NavLink
                  href={item.href}
                  onClick={close}
                  className="flex min-h-14 items-center font-display text-3xl font-bold tracking-wide uppercase hover:text-ice aria-[current=page]:text-ice"
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <NavLink
            href={followNavItem.href}
            onClick={close}
            className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-md border border-ice px-5 text-sm font-bold text-ice hover:bg-white/8"
          >
            {followNavItem.label}
            <span aria-hidden="true">↗</span>
          </NavLink>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
