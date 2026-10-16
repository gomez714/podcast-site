import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import Link from "next/link";
import type { ComponentProps } from "react";

import { buttonVariants } from "@/components/ui/button";

type ButtonLinkProps = ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>;

/** A link styled as a button. Use for navigation; use `Button` for in-page actions. */
export function ButtonLink({
  className,
  variant = "primary",
  size = "cta",
  ...props
}: ButtonLinkProps) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
