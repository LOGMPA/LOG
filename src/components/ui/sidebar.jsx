import React from "react";
import { cn } from "../../lib/utils";

export function SidebarProvider({ children }) { return <>{children}</>; }
export function Sidebar({ className, children }) {
  return <aside className={cn("hidden md:flex w-64 flex-col bg-white", className)}>{children}</aside>;
}
export function SidebarHeader({ className, children }) { return <div className={cn("", className)}>{children}</div>; }
export function SidebarContent({ className, children }) { return <div className={cn("flex-1 overflow-auto", className)}>{children}</div>; }
export function SidebarGroup({ children }) { return <div className="p-2">{children}</div>; }
export function SidebarGroupLabel({ className, children }) { return <div className={cn("", className)}>{children}</div>; }
export function SidebarGroupContent({ children }) { return <div>{children}</div>; }
export function SidebarMenu({ children }) { return <ul>{children}</ul>; }
export function SidebarMenuItem({ children }) { return <li>{children}</li>; }
export function SidebarMenuButton({ className, asChild, children }) {
  if (asChild) return children;
  return <button className={cn("w-full text-left", className)}>{children}</button>;
}
export function SidebarTrigger({ className }) {
  return <button className={"md:hidden " + (className || "")}>☰</button>;
}
