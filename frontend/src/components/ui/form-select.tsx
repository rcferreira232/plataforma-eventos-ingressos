import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

export interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: readonly SelectOption[]
  error?: string
  helperText?: string
  placeholder?: string
  containerClassName?: string
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      className,
      label,
      options,
      error,
      helperText,
      placeholder = "Selecione uma opção",
      containerClassName,
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const selectId = id || generatedId
    const errorId = `${selectId}-error`
    const helperId = `${selectId}-helper`

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-foreground flex items-center gap-1 select-none"
          >
            {label}
            {required && <span className="text-destructive font-semibold">*</span>}
          </label>
        )}

        <select
          id={selectId}
          ref={ref}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          className={cn(
            "flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm text-foreground ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/20 cursor-pointer",
            error && "border-destructive focus-visible:ring-destructive/50 aria-invalid:border-destructive",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled selected hidden className="text-muted-foreground bg-background">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={String(option.value)}
              value={option.value}
              disabled={option.disabled}
              className="bg-background text-foreground"
            >
              {option.label}
            </option>
          ))}
        </select>

        {error ? (
          <p id={errorId} className="text-xs font-medium text-destructive animate-in fade-in-50">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        ) : null}
      </div>
    )
  }
)

FormSelect.displayName = "FormSelect"
