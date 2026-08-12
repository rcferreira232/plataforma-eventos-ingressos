import * as React from "react"
import { cn } from "@/lib/utils"

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: "none" | "sm" | "md" | "lg" | "xl"
}

const spacingClasses: Record<NonNullable<SectionProps["spacing"]>, string> = {
  none: "py-0",
  sm: "py-6 sm:py-8",
  md: "py-10 sm:py-12",
  lg: "py-14 sm:py-16",
  xl: "py-20 sm:py-24",
}

export function Section({
  className,
  spacing = "md",
  ...props
}: SectionProps) {
  return (
    <section
      className={cn("w-full relative", spacingClasses[spacing], className)}
      {...props}
    />
  )
}
