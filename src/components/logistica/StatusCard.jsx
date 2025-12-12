import React from "react";
import { Card, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";

export default function StatusCard({ status, count, icon: Icon, color }) {
  return (
    <Card className={cn("relative overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300", color.bg)}>
      <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 transform translate-x-12 -translate-y-12", color.accent)} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={cn("text-sm font-medium mb-1", color.text)}>{status}</p>
            <p className={cn("text-3xl font-bold", color.text)}>{count}</p>
          </div>
          <div className={cn("p-4 rounded-2xl", color.accent, "bg-opacity-20")}>
            <Icon className={cn("w-6 h-6", color.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
