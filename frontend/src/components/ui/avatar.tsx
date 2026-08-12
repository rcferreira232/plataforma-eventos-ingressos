import * as React from "react";
import Image, { type ImageProps } from "next/image";

import { User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-lg",
};

export function Avatar({ className, size = "md", ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full border border-border bg-muted select-none items-center justify-center font-medium text-foreground",
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}

export interface AvatarImageProps extends Omit<
  ImageProps,
  "alt" | "onLoad" | "onError"
> {
  alt?: string;
  onLoadingStatusChange?: (status: "loading" | "loaded" | "error") => void;
}

export function AvatarImage({
  className,
  alt = "Avatar",
  onLoadingStatusChange,
  ...props
}: AvatarImageProps) {
  const [hasError, setHasError] = React.useState(false);

  if (hasError) return null;

  return (
    <Image
      alt={alt}
      onError={() => {
        setHasError(true);
        onLoadingStatusChange?.("error");
      }}
      onLoad={() => {
        onLoadingStatusChange?.("loaded");
      }}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  );
}

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> {
  name?: string;
}

export function AvatarFallback({
  name,
  className,
  children,
  ...props
}: AvatarFallbackProps) {
  const getInitials = (str?: string): string => {
    if (!str) return "";

    const parts = str.trim().split(" ").filter(Boolean);

    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  return (
    <span
      className={cn(
        "flex h-full w-full items-center justify-center bg-muted text-muted-foreground font-semibold",
        className,
      )}
      {...props}
    >
      {children || initials || (
        <User className='size-1/2 text-muted-foreground' />
      )}
    </span>
  );
}
