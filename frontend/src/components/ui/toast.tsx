import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react"

export type ToastType = "info" | "success" | "warning" | "error"

export interface ToastProps {
  id?: string
  type?: ToastType
  title: string
  description?: string
  onClose?: () => void
  className?: string
}

const iconMap: Record<ToastType, React.ReactNode> = {
  info: <Info className="size-5 text-blue-400 shrink-0" />,
  success: <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />,
  warning: <AlertTriangle className="size-5 text-amber-400 shrink-0" />,
  error: <XCircle className="size-5 text-destructive shrink-0" />,
}

export function Toast({
  type = "info",
  title,
  description,
  onClose,
  className,
}: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border border-border bg-card shadow-lg text-foreground transition-all animate-in fade-in slide-in-from-top-2 max-w-md w-full",
        className
      )}
    >
      {iconMap[type]}

      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold leading-tight">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Fechar notificação"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
