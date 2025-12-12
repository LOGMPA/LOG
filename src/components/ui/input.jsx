import React from "react";
export function Input({ className = "", ...props }) {
  return <input className={"w-full rounded-lg border border-gray-300 px-3 py-2 text-sm " + className} {...props} />;
}
