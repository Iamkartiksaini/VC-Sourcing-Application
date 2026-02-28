"use client";

import { useState } from "react";
import { BookmarkCheck, Trash2, PlayCircle, SlidersHorizontal } from "lucide-react";
import { useApp } from "@/lib/store";
import { useRouter } from "next/navigation";
import { FilterState } from "@/lib/types";

export default function SavedSearchesPage() {
  const { savedSearches, deleteSavedSearch, setFilters } = useApp();
  const router = useRouter();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const runSearch = (filters: FilterState) => {
    setFilters(filters);
    router.push("/companies");
  };

  const summariseFilters = (f: FilterState): string => {
    const parts: string[] = [];
    if (f.search) parts.push(`"${f.search}"`);
    if (f.industries.length) parts.push(f.industries.join(", "));
    if (f.stages.length) parts.push(f.stages.join(", "));
    if (f.minThesisScore > 0) parts.push(`Score ≥ ${f.minThesisScore}`);
    return parts.length ? parts.join(" · ") : "No filters";
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-white/[0.06] px-8 py-5">
        <h1 className="text-xl font-semibold text-white">Saved Searches</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Re-run your precision search configurations instantly
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {savedSearches.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <BookmarkCheck className="h-8 w-8 text-zinc-600" />
            </div>
            <p className="text-lg font-medium text-zinc-400 mb-1">No saved searches yet</p>
            <p className="text-sm text-zinc-600 mb-6">
              Go to the Companies page, apply filters, and click "Save" to save your search here.
            </p>
          </div>
        )}
        <div className="space-y-3">
          {savedSearches.map((ss) => (
            <div
              key={ss.id}
              className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 hover:bg-white/[0.04] transition-all group"
              id={`saved-search-${ss.id}`}
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-violet-600/10 border border-violet-500/20">
                <SlidersHorizontal className="h-4 w-4 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{ss.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5 truncate">{summariseFilters(ss.filters)}</p>
                <p className="text-[10px] text-zinc-700 mt-1">
                  Saved {new Date(ss.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => runSearch(ss.filters)}
                className="flex items-center gap-2 rounded-xl bg-violet-600/10 border border-violet-500/20 px-3 py-2 text-sm text-violet-400 hover:bg-violet-600/20 hover:text-violet-300 transition-all"
                id={`run-search-${ss.id}-btn`}
              >
                <PlayCircle className="h-4 w-4" />
                Run
              </button>
              <button
                onClick={() => setDeleteConfirm(ss.id)}
                className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                id={`delete-search-${ss.id}-btn`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#161b22] p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-2">Delete Search?</h3>
            <p className="text-sm text-zinc-500 mb-5">This saved search will be permanently removed.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-xl border border-white/[0.06] py-2.5 text-sm text-zinc-400 hover:text-white transition-all">
                Cancel
              </button>
              <button
                onClick={() => { deleteSavedSearch(deleteConfirm); setDeleteConfirm(null); }}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-medium text-white hover:bg-rose-500 transition-all"
                id="confirm-delete-search-btn"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
