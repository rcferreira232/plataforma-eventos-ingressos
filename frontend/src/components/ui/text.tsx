import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textVariants = cva("font-sans", {
  variants: {
    variant: {
      default: "text-base text-foreground leading-relaxed",
      muted: "text-sm text-muted-foreground leading-relaxed",
      lead: "text-lg sm:text-xl font-normal text-muted-foreground leading-relaxed",
      large: "text-lg font-medium text-foreground",
      small: "text-sm font-medium text-muted-foreground leading-none",
      xs: "text-xs text-muted-foreground leading-normal",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  as?: "p" | "span" | "div" | "label" | "small"
}

export function Text({
  className,
  variant = "default",
  as: Component = "p",
  ...props
}: TextProps) {
  return (
    <Component
      className={cn(textVariants({ variant, className }))}
      {...props}
    />
  )
}
