import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        // Solid bg-card (not transparent) so it's visible in both dark and light modes
        // border-border uses the theme variable which is now properly contrasted (see globals.css)
        "flex h-11 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground " +
        "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium " +
        "placeholder:text-muted-foreground focus-visible:outline-none focus:ring-2 focus:ring-primary/50 " +
        "focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
