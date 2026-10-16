import type { Metadata } from "next";

import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <Section tone="dark" aria-labelledby="not-found-heading" className="flex-1">
      <p className="eyebrow text-ice">404</p>
      <h1 id="not-found-heading" className="my-6 max-w-3xl display-xl">
        This pane is <span className="block text-ice">still closed.</span>
      </h1>
      <p className="mb-8 max-w-[52ch] text-pale">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <ButtonLink href="/">Back to home</ButtonLink>
    </Section>
  );
}
