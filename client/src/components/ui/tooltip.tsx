import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../../lib/utils"; // Corrected import path

const Tooltip = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root> & { className?: string }
>(({ className, children, ...props }, ref) => (
  <TooltipPrimitive.Root {...props}>
    <TooltipPrimitive.Trigger ref={ref} className={cn("cursor-pointer", className)}>
      {children}
    </TooltipPrimitive.Trigger>
    <TooltipPrimitive.Content className="z-50 rounded-md bg-gray-800 p-2 text-sm text-white">
      Tooltip content
      <TooltipPrimitive.Arrow className="fill-gray-800" />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Root>
));
Tooltip.displayName = TooltipPrimitive.Root.displayName;

export { Tooltip };
