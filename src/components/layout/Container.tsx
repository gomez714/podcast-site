import { cn } from "cn";
import type { ComponentProps } from "react";

/** Horizontal page gutter and max width shared by header, sections and footer. */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1440px] px-[clamp(1.125rem,6vw,5.625rem)]", className)}
      {...props}
    />
  );
}
