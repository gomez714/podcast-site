"use client";

import { useEffect } from "react";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Section tone="dark" aria-labelledby="error-heading">
      <p className="eyebrow text-ice">Something went wrong</p>
      <h1 id="error-heading" className="my-6 max-w-3xl display-xl">
        We couldn&apos;t <span className="block text-ice">load this page.</span>
      </h1>
      <p className="mb-8 max-w-[52ch] text-pale">
        Please try again. If the problem continues, come back a little later.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" size="cta" onClick={() => retry()}>
          Try again
        </Button>
        <ButtonLink href="/" variant="outline-on-dark">
          Back to home
        </ButtonLink>
      </div>
    </Section>
  );
}
