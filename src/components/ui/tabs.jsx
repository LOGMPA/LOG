import React, { createContext, useContext } from "react";
import { cn } from "../../lib/utils";

const TabsContext = createContext(null);

export function Tabs({ value, onValueChange, children, className }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn("flex flex-col gap-4", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-xl bg-gray-100 p-1",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be used within <Tabs>");
  const isActive = ctx.value === value;

  return (
    <button
      type="button"
      onClick={() => ctx.onValueChange && ctx.onValueChange(value)}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
        isActive
          ? "bg-white text-emerald-700 shadow-sm"
          : "text-gray-600 hover:text-gray-900 hover:bg-white/70",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be used within <Tabs>");
  if (ctx.value !== value) return null;

  return <div className={cn("", className)}>{children}</div>;
}
