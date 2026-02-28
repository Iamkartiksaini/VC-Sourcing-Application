"use client";

import { useState } from "react";
import { X, SlidersHorizontal, Search, RotateCcw, BookmarkPlus } from "lucide-react";
import { FilterState, Industry, Stage, DEFAULT_FILTERS } from "@/lib/types";
import { cn } from "@/lib/utils";

const ALL_INDUSTRIES: Industry[] = [
  "B2B SaaS", "Fintech", "AI/ML", "HealthTech", "EdTech",
  "CleanTech", "Consumer", "DeepTech", "Marketplace",
];

const ALL_STAGES: Stage[] = ["Pre-Seed", "Seed", "Series A", "Series B+"];

interface FilterBarProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onReset: () => void;
  onSave: () => void;
  resultCount: number;
}

export function FilterBar({ filters, onChange, onReset, onSave, resultCount }: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  const toggle = <T,>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const isDirty =
    filters.search !== DEFAULT_FILTERS.search ||
    filters.industries.length > 0 ||
    filters.stages.length > 0 ||
    filters.minEmployees !== DEFAULT_FILTERS.minEmployees ||
    filters.maxEmployees !== DEFAULT_FILTERS.maxEmployees ||
    filters.minThesisScore !== DEFAULT_FILTERS.minThesisScore;

  return (
    <div className="space-y-3">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            id="filter-search"
            type="text"
            placeholder="Search companies..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-violet-500/50 focus:bg-white/[0.05] transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filters toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          id="filter-toggle-btn"
          className={cn(
            "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
            expanded || isDirty
              ? "border-violet-500/40 bg-violet-600/10 text-violet-300"
              : "border-white/[0.06] bg-white/[0.03] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {isDirty && (
            <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white">
              !
            </span>
          )}
        </button>

        {isDirty && (
          <button
            onClick={onReset}
            id="filter-reset-btn"
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-xs text-zinc-500 hover:text-zinc-300 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        )}

        {isDirty && (
          <button
            onClick={onSave}
            id="filter-save-btn"
            className="flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-600/10 px-3 py-2.5 text-xs text-violet-400 hover:bg-violet-600/20 transition-all"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            Save
          </button>
        )}

        <span className="text-xs text-zinc-600 whitespace-nowrap">
          {resultCount} {resultCount === 1 ? "company" : "companies"}
        </span>
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-4">
          {/* Industries */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">
              Industry
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_INDUSTRIES.map((ind) => (
                <button
                  key={ind}
                  onClick={() =>
                    onChange({ ...filters, industries: toggle(filters.industries, ind) })
                  }
                  id={`filter-industry-${ind.replace(/\//g, "-")}`}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                    filters.industries.includes(ind)
                      ? "border-violet-500/50 bg-violet-600/20 text-violet-300"
                      : "border-white/[0.06] bg-white/[0.02] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.1]"
                  )}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>

          {/* Stages */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">
              Stage
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_STAGES.map((stage) => (
                <button
                  key={stage}
                  onClick={() =>
                    onChange({ ...filters, stages: toggle(filters.stages, stage) })
                  }
                  id={`filter-stage-${stage.replace(/\+/g, "plus").replace(/ /g, "-")}`}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                    filters.stages.includes(stage)
                      ? "border-emerald-500/50 bg-emerald-600/20 text-emerald-300"
                      : "border-white/[0.06] bg-white/[0.02] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.1]"
                  )}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>

          {/* Thesis Score */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">
              Min Thesis Score: {filters.minThesisScore}+
            </p>
            <input
              type="range"
              min={0}
              max={100}
              value={filters.minThesisScore}
              onChange={(e) =>
                onChange({ ...filters, minThesisScore: Number(e.target.value) })
              }
              id="filter-thesis-score"
              className="w-full accent-violet-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
              <span>Any</span><span>50</span><span>75</span><span>90+</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
