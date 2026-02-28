"use client";

import { cn } from "@/lib/utils";

interface ThesisScoreBadgeProps {
  score?: number;
  size?: "sm" | "lg";
}

export function ThesisScoreBadge({ score, size = "sm" }: ThesisScoreBadgeProps) {
  if (score === undefined) {
    return (
      <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-xs text-zinc-600">
        —
      </span>
    );
  }

  const color =
    score >= 85
      ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
      : score >= 70
        ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
        : "text-zinc-400 border-zinc-700 bg-white/[0.04]";

  if (size === "lg") {
    return (
      <div className="flex flex-col items-start gap-1.5">
        <div className="flex items-baseline gap-1.5">
          <span className={cn("text-4xl font-bold tabular-nums", color.split(" ")[0])}>
            {score}
          </span>
          <span className="text-lg text-zinc-600">/100</span>
        </div>
        <div className="relative h-2 w-36 rounded-full bg-white/[0.06]">
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-all",
              score >= 85 ? "bg-emerald-400" : score >= 70 ? "bg-amber-400" : "bg-zinc-500"
            )}
            style={{ width: `${score}%` }}
          />
        </div>
        <span
          className={cn("rounded-full border px-2.5 py-0.5 mt-1 text-xs font-medium", color)}
        >
          {score >= 85 ? "Strong Fit" : score >= 70 ? "Potential Fit" : "Weak Fit"}
        </span>
      </div>
    );
  }

  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs font-semibold tabular-nums",
        color
      )}
    >
      {score}
    </span>
  );
}
