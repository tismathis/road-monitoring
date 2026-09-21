import * as React from "react"
import { cn } from "cn"

import { Label } from "./label"
import { Separator } from "./separator"

function FieldGroup({ className, ...props }) {
  return (
    <div
      data-slot="field-group"
      className={cn("flex w-full flex-col gap-5", className)}
      {...props} />
  );
}

function Field({ className, ...props }) {
  return (
    <div
      role="group"
      data-slot="field"
      className={cn("flex w-full flex-col gap-2", className)}
      {...props} />
  );
}

function FieldLabel({ className, ...props }) {
  return (
    <Label
      data-slot="field-label"
      className={cn("text-[13px] font-medium text-gb-foreground", className)}
      {...props} />
  );
}

function FieldDescription({ className, ...props }) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-[12.5px] leading-normal text-gb-muted-foreground [&>a]:text-gb-primary [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props} />
  );
}

function FieldSeparator({ children, className, ...props }) {
  return (
    <div
      data-slot="field-separator"
      className={cn("relative -my-1 h-5 text-[12px]", className)}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span className="relative mx-auto block w-fit bg-gb-card px-2 text-gb-muted-foreground">
          {children}
        </span>
      )}
    </div>
  );
}

function FieldError({ className, children, ...props }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("text-[12.5px] font-medium text-gb-destructive", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Field, FieldLabel, FieldDescription, FieldError, FieldGroup, FieldSeparator }
