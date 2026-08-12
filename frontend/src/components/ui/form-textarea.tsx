import * as React from "react";
import { cn } from "@/lib/utils";

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FormTextareaProps
>(
  (
    {
      className,
      label,
      error,
      helperText,
      containerClassName,
      id,
      required,
      disabled,
      rows = 4,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className='text-sm font-medium text-foreground flex items-center gap-1 select-none'
          >
            {label}
            {required && (
              <span className='text-destructive font-semibold'>*</span>
            )}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            "flex min-h-20 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm text-foreground ring-offset-background transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/20 resize-y",
            error &&
              "border-destructive focus-visible:ring-destructive/50 aria-invalid:border-destructive",
            className,
          )}
          {...props}
        />

        {error ? (
          <p
            id={errorId}
            className='text-xs font-medium text-destructive animate-in fade-in-50'
          >
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className='text-xs text-muted-foreground'>
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

FormTextarea.displayName = "FormTextarea";
