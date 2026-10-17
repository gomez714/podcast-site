import { cn } from "cn";
import type { ComponentProps, ReactNode } from "react";

import { Container } from "./Container";

const toneClass = {
  dark: "surface-dark",
  light: "surface-light",
  paper: "surface-paper",
} as const;

type SectionProps = Omit<ComponentProps<"section">, "children"> & {
  /** dark = navy chapter, light = pale cyan, paper = white (spec §3.1 colour rhythm). */
  tone: keyof typeof toneClass;
  children: ReactNode;
  containerClassName?: string;
};

export function Section({ tone, className, containerClassName, children, ...props }: SectionProps) {
  return (
    <section className={cn(toneClass[tone], "py-[clamp(3rem,8vw,6.5rem)]", className)} {...props}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

type SectionHeadingProps = {
  id: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
};

/** Eyebrow + H2 pair. The eyebrow colour follows the surface: ice on navy, slate on light. */
export function SectionHeading({ id, eyebrow, children, className }: SectionHeadingProps) {
  return (
    <div className={className}>
      {eyebrow && <p className="eyebrow text-slate in-[.surface-dark]:text-ice">{eyebrow}</p>}
      <h2 id={id} className="mt-4 mb-6 display-lg text-balance">
        {children}
      </h2>
    </div>
  );
}
