import React from "react";
export function Table({ children }) { return <table className="min-w-full text-left text-sm">{children}</table>; }
export function TableHeader({ children }) { return <thead className="text-gray-700">{children}</thead>; }
export function TableBody({ children }) { return <tbody>{children}</tbody>; }
export function TableRow({ children, className }) { return <tr className={className}>{children}</tr>; }
export function TableHead({ children, className }) { return <th className={"px-3 py-2 font-medium " + (className || "")}>{children}</th>; }
export function TableCell({ children, className, colSpan }) { return <td className={"px-3 py-2 align-top " + (className || "")} colSpan={colSpan}>{children}</td>; }
