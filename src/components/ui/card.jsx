import React from "react";
import { cn } from "../../lib/utils";

export function Card({ className, children }) {
  return <div className={cn("bg-white rounded-xl border border-gray-200", className)}>{children}</div>;
}
export function CardHeader({ className, children }) {
  return <div className={cn("p-4 border-b border-gray-200", className)}>{children}</div>;
}
export function CardTitle({ className, children }) {
  return <h3 className={cn("font-semibold", className)}>{children}</h3>;
}
export function CardContent({ className, children }) {
  return <div className={cn("p-4", className)}>{children}</div>;
}
