import * as React from "react"
import { Link as InertiaLink } from "@inertiajs/react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { type VariantProps } from "class-variance-authority"

interface LinkProps
  extends VariantProps<typeof buttonVariants> {
  href: string
  className?: string
  children: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  [key: string]: any
}

export function Link({
  className,
  variant,
  size,
  href,
  children,
  ...props
}: LinkProps) {
  return (
    <InertiaLink
      href={href}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </InertiaLink>
  )
}
