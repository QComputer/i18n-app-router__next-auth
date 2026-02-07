/**
 * Separator Component
 * 
 * A visual divider component for separating content.
 */

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cn } from "@/lib/utils"

/**
 * Separator component props
 */
interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  /**
   * Optional label for the separator
   */
  label?: React.ReactNode
}

/**
 * Separator Component
 * 
 * @param props - SeparatorPrimitive.Root props including orientation and decorative
 * @param ref - Forwarded ref
 * @returns JSX element
 */
const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      // Base styles
      "shrink-0 bg-border",
      // Horizontal orientation
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    )}
    {...props}
  />
))
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
