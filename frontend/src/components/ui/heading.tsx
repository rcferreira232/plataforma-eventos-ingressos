import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const headingVariants = cva("font-sans tracking-tight text-foreground", {
  variants: {
    variant: {
      h1: "text-3xl font-extrabold sm:text-4xl lg:text-5xl",
      h2: "text-2xl font-bold sm:text-3xl",
      h3: "text-xl font-semibold sm:text-2xl",
      h4: "text-lg font-semibold",
      h5: "text-base font-semibold",
      h6: "text-sm font-semibold",
    },
  },
  defaultVariants: {
    variant: "h1",
  },
})

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span" | "p"
}

export function Heading({
  className,
  variant = "h1",
  as,
  ...props
}: HeadingProps) {
  const Component = as || (variant as React.ElementType) || "h1"

  return (
    <Component
      className={cn(headingVariants({ variant, className }))}
      {...props}
    />
  )
}
