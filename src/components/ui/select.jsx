import React from "react";
export function Select({ value, onValueChange, children }) {
  return <select value={value} onChange={(e) => onValueChange(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">{children}</select>;
}
export function SelectTrigger({ className = "", children }) { return <div className={className}>{children}</div>; }
export function SelectContent({ children }) { return <>{children}</>; }
export function SelectItem({ value, children }) { return <option value={value}>{children}</option>; }
export function SelectValue({ placeholder }) { return <span className="text-gray-500">{placeholder}</span>; }
