import React from "react";
import { cn } from "../../lib/utils";

export function Button({ asChild = false, className, children, variant = "default", ...props }) {
  const base = "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm transition-all";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 shadow",
    outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50",
    ghost: "text-gray-700 hover:bg-gray-100"
  };
  const cls = cn(base, variants[variant], className);
  if (asChild) {
    const Child = React.Children.only(children);
    return React.cloneElement(Child, { className: cn(Child.props.className, cls), ...props });
  }
  return <button className={cls} {...props}>{children}</button>;
}
