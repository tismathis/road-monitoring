import * as React from "react"
import { cn } from "cn"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-[6px] border border-gb-input bg-gb-background-2 px-3 py-1 text-[13.5px] text-gb-foreground transition-colors outline-none selection:bg-gb-primary selection:text-gb-primary-foreground placeholder:text-gb-muted-foreground/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-gb-ring focus-visible:ring-[3px] focus-visible:ring-gb-ring/25",
        "aria-invalid:border-gb-destructive aria-invalid:ring-gb-destructive/20",
        className
      )}
      {...props} />
  );
}

export { Input }
