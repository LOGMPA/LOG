import React from "react";
export function Label({ className = "", ...props }) {
  return <label className={"text-sm text-gray-700 " + className} {...props} />;
}
