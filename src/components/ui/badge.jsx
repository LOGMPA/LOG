import React from "react";
import { cn } from "../../lib/utils";

export function Badge({ className, children, variant = "secondary" }) {
  const variants = {
    secondary: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    info: "bg-blue-100 text-blue-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-800"
  };
  return <span className={cn("inline-flex items-center rounded px-1.5 py-0.5 text-xs border", variants[variant], className)}>{children}</span>;
}
