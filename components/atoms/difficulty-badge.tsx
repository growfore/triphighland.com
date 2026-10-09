"use client";

import {  LucideGauge } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DifficultyBadge({
  difficulty = "easy",
}: {
  difficulty: "easy" | "moderate" | "hard" | "extreme";
}) {
  switch (difficulty) {
    case "easy":
      return <Comp text="Easy" filledDotsCount={1} />;
    case "moderate":
      return <Comp text="Moderate" filledDotsCount={2} />;
    case "hard":
      return <Comp text="Hard" filledDotsCount={3} />;
    case "extreme":
      return <Comp text="Extreme" filledDotsCount={4} />;
    default:
      return <Comp text="Normal" filledDotsCount={0} />;
  }
}

function Comp({
  text,
  filledDotsCount,
}: {
  text: string;
  filledDotsCount: number;
}) {
  return (
    <div
      className="text-sm flex items-center justify-center gap-1 bg-black/10 p-1 rounded-md text-black font-medium"
    >
      <LucideGauge className="size-5" />
      <div>{text ?? "Normal"}</div>
      <div className="flex gap-1 items-center">
        {Array.from({ length: 4 }).map((dot, index) => (
          <div
          key={index}
            className={cn(
              filledDotsCount > index 
                ? "bg-green-600 border-green-600"
                : "border-green-600",
              "size-3 rounded-full border",
            )}
          ></div>
        ))}
      </div>
    </div>
  );
}
