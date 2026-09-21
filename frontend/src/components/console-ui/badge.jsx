import * as React from "react"
import { cva } from "class-variance-authority";
import { cn } from "cn"
import { Slot } from "radix-ui"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[4px] border border-transparent px-1.5 py-0.5 text-[10px] font-semibold tracking-wide whitespace-nowrap transition-[color,box-shadow] focus-visible:border-gb-ring focus-visible:ring-[3px] focus-visible:ring-gb-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-gb-primary/15 text-gb-primary",
        secondary: "bg-gb-secondary text-gb-secondary-foreground",
        destructive: "bg-gb-destructive/15 text-gb-destructive",
        success: "bg-gb-success/15 text-gb-success",
        warning: "bg-gb-warning/15 text-gb-warning",
        outline: "border-gb-border text-gb-foreground",
        ghost: "text-gb-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }
