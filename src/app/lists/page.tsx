"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, ArrowRight, Layers, Building2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const LIST_COLOR_OPTIONS = [
  { label: "Violet", value: "bg-violet-500" },
  { label: "Blue", value: "bg-blue-500" },
  { label: "Emerald", value: "bg-emerald-500" },
  { label: "Amber", value: "bg-amber-500" },
  { label: "Rose", value: "bg-rose-500" },
  { label: "Cyan", value: "bg-cyan-500" },
];

export default function ListsPage() {
  const { lists, companies, createList, deleteList, exportCompanies, isInitialLoading } = useApp();
  const [newListModal, setNewListModal] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState("bg-violet-500");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreate = () => {
    if (name.trim()) {
      createList(name.trim(), desc.trim(), color);
      setName("");
      setDesc("");
      setColor("bg-violet-500");
      setNewListModal(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-8 py-5">
        <div>
          <h1 className="text-xl font-semibold text-white">My Lists</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Curated company collections organised by thesis or deal stage
          </p>
        </div>
        <button
          onClick={() => setNewListModal(true)}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/20"
          id="create-list-header-btn"
        >
          <Plus className="h-4 w-4" />
          New List
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {isInitialLoading ? (
          <div className="flex h-64 items-center justify-center text-zinc-500 text-sm animate-pulse">
            Loading lists...
          </div>
        ) : lists.length === 0 && !newListModal ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-24">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <Layers className="h-8 w-8 text-zinc-600" />
            </div>
            <p className="text-lg font-medium text-zinc-400 mb-1">No lists created</p>
            <p className="text-sm text-zinc-600 mb-6">
              Create collections of companies based on your investment thesis.
            </p>
            <button
              onClick={() => setNewListModal(true)}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/20"
              id="create-list-empty-btn"
            >
              <Plus className="h-4 w-4" />
              Create your first list
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Create card */}
            {newListModal && (
              <div className="rounded-2xl border border-violet-500/20 bg-violet-600/5 p-5 space-y-3">
                <p className="text-sm font-semibold text-white">New List</p>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="List name"
                  className="w-full rounded-xl border border-white/[0.06] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-violet-500/50 transition-all"
                  id="create-list-name-input"
                />
                <input
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full rounded-xl border border-white/[0.06] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-violet-500/50 transition-all"
                  id="create-list-desc-input"
                />
                <div className="flex gap-2">
                  {LIST_COLOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setColor(opt.value)}
                      className={cn(
                        "h-6 w-6 rounded-full transition-all",
                        opt.value,
                        color === opt.value ? "ring-2 ring-white ring-offset-2 ring-offset-black/50" : "opacity-50 hover:opacity-100"
                      )}
                      title={opt.label}
                      id={`color-option-${opt.label.toLowerCase()}`}
                    />
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setNewListModal(false)}
                    className="flex-1 rounded-xl border border-white/[0.06] py-2 text-sm text-zinc-500 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    className="flex-1 rounded-xl bg-violet-600 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-all"
                    id="create-list-submit-btn"
                  >
                    Create
                  </button>
                </div>
              </div>
            )}

            {lists.map((list) => {
              const listCos = companies.filter((c) => list.companyIds.includes(c.id));
              return (
                <div
                  key={list.id}
                  className="relative rounded-2xl border border-white/[0.08] bg-[#161b22] p-6 shadow-xl flex flex-col group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className={cn("h-3 w-3 rounded-full flex-shrink-0", list.color)} />
                      <h3 className="font-semibold text-white">{list.name}</h3>
                    </div>
                    <button
                      onClick={() => setDeleteConfirm(list.id)}
                      className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                      id={`delete-list-${list.id}-btn`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {list.description && (
                    <p className="text-xs text-zinc-500 mb-3">{list.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      {listCos.length} companies
                    </div>
                    {listCos.length > 0 && (
                      <button
                        onClick={() => exportCompanies(list.companyIds, "csv")}
                        className="rounded-md bg-white/[0.04] px-2 py-1 text-[10px] text-zinc-400 hover:bg-white/[0.08] hover:text-white transition-all"
                        id={`export-list-${list.id}-btn`}
                      >
                        Export CSV
                      </button>
                    )}
                  </div>

                  {/* Mini company preview */}
                  {listCos.length > 0 && (
                    <div className="mt-4 flex -space-x-2 overflow-hidden">
                      {listCos.slice(0, 5).map((c) => (
                        <div
                          key={c.id}
                          className="inline-block h-6 w-6 rounded-full border-2 border-[#161b22] bg-white/[0.05] text-[10px] font-bold text-violet-400 flex items-center justify-center"
                          title={c.name}
                        >
                          {c.name.charAt(0)}
                        </div>
                      ))}
                      {listCos.length > 5 && (
                        <div className="inline-block h-6 w-6 rounded-full border-2 border-[#161b22] bg-white/[0.05] text-[10px] font-bold text-zinc-400 flex items-center justify-center">
                          +{listCos.length - 5}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 mt-auto border-t border-white/[0.04] mt-4">
                    <Link
                      href={`/lists/${list.id}`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/[0.04] py-2 text-xs text-zinc-400 hover:bg-white/[0.08] hover:text-white transition-all"
                      id={`view-list-${list.id}-btn`}
                    >
                      View
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#161b22] p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-2">Delete List?</h3>
            <p className="text-sm text-zinc-500 mb-5">
              This will remove the list permanently. Companies won't be deleted.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-xl border border-white/[0.06] py-2.5 text-sm text-zinc-400 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteList(deleteConfirm);
                  setDeleteConfirm(null);
                }}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-medium text-white hover:bg-rose-500 transition-all"
                id="confirm-delete-list-btn"
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
