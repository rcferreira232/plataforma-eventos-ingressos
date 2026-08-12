import * as React from "react"
import { Heading } from "@/components/ui/heading"
import { Text } from "@/components/ui/text"
import { cn } from "@/lib/utils"

export interface PageHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: string | React.ReactNode
  description?: string | React.ReactNode
  actions?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-6 md:flex-row md:items-center md:justify-between border-b border-border mb-6",
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        {typeof title === "string" ? (
          <Heading variant="h2">{title}</Heading>
        ) : (
          title
        )}
        {description && (
          typeof description === "string" ? (
            <Text variant="muted">{description}</Text>
          ) : (
            description
          )
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3 shrink-0">{actions}</div>
      )}
    </div>
  )
}
