import * as React from "react"
import { cn } from "@/lib/utils"

export interface FormErrorMessageProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  message?: string
}

export function FormErrorMessage({
  message,
  className,
  ...props
}: FormErrorMessageProps) {
  if (!message) return null

  return (
    <p
      className={cn(
        "text-xs font-medium text-destructive animate-in fade-in-50 flex items-center gap-1",
        className
      )}
      {...props}
    >
      {message}
    </p>
  )
}
