/**
 * Badge Component
 * 
 * A versatile badge component for displaying status, labels, or notifications.
 * Supports different variants and sizes.
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Badge variant definitions
 * Uses class-variance-authority for easy variant management
 */
const badgeVariants = cva(
  // Base styles
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Default gray badge
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        // Secondary gray badge
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        // Success green badge
        success:
          "border-transparent bg-green-500 text-white hover:bg-green-600",
        // Warning yellow badge
        warning:
          "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
        // Error/destructive red badge
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        // Outline badge with border
        outline: "text-foreground border-gray-300",
        // Info blue badge
        info:
          "border-transparent bg-blue-500 text-white hover:bg-blue-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Badge component props
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge Component
 * 
 * @param props - BadgeProps including variant and className
 * @returns JSX element
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

/**
 * Status Badge Component
 * Pre-configured badge for common appointment statuses
 */
function StatusBadge({ 
  status, 
  className 
}: { 
  status: string
  className?: string 
}) {
  const statusConfig: Record<string, { label: string; variant: VariantProps<typeof badgeVariants>["variant"] }> = {
    PENDING: { label: "در انتظار", variant: "warning" },
    CONFIRMED: { label: "تأیید شده", variant: "success" },
    COMPLETED: { label: "تکمیل شده", variant: "info" },
    CANCELLED: { label: "لغو شده", variant: "destructive" },
  }
  
  const config = statusConfig[status] || { label: status, variant: "default" }
  
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}

export { Badge, badgeVariants, StatusBadge }
