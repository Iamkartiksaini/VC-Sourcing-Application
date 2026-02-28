"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, Layers, BookmarkCheck, X } from "lucide-react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

type ResultItem =
  | { type: "company"; id: string; label: string; sub: string }
  | { type: "page"; href: string; label: string; sub: string };

export function CommandPalette() {
  const { companies, commandPaletteOpen, setCommandPaletteOpen } = useApp();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const STATIC_PAGES: ResultItem[] = [
    { type: "page", href: "/companies", label: "Companies", sub: "Discovery Hub" },
    { type: "page", href: "/lists", label: "My Lists", sub: "Curated Collections" },
    { type: "page", href: "/saved-searches", label: "Saved Searches", sub: "Saved Filters" },
  ];

  const results: ResultItem[] = query.trim()
    ? [
        ...companies
          .filter(
            (c) =>
              c.name.toLowerCase().includes(query.toLowerCase()) ||
              c.industry.toLowerCase().includes(query.toLowerCase()) ||
              c.domain.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 5)
          .map<ResultItem>((c) => ({
            type: "company",
            id: c.id,
            label: c.name,
            sub: `${c.industry} · ${c.stage} · ${c.location}`,
          })),
        ...STATIC_PAGES.filter((p) =>
          p.label.toLowerCase().includes(query.toLowerCase())
        ),
      ]
    : STATIC_PAGES;

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === "Escape") setCommandPaletteOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelected(0);
    }
  }, [commandPaletteOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      navigate(results[selected]);
    }
  };

  const navigate = (item?: ResultItem) => {
    if (!item) return;
    setCommandPaletteOpen(false);
    if (item.type === "company") router.push(`/companies/${item.id}`);
    else router.push(item.href);
  };

  if (!commandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#161b22] shadow-2xl shadow-black/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Command Palette"
        id="command-palette"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
          <Search className="h-4 w-4 text-zinc-500 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search companies, pages..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
            id="command-palette-input"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-zinc-600 hover:text-zinc-400">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <kbd className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-zinc-500">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <ul className="max-h-72 overflow-y-auto py-2">
          {results.length === 0 && (
            <li className="py-8 text-center text-sm text-zinc-600">No results found</li>
          )}
          {results.map((item, i) => {
            const Icon =
              item.type === "company"
                ? Building2
                : item.label === "My Lists"
                ? Layers
                : BookmarkCheck;
            return (
              <li key={i}>
                <button
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                    i === selected
                      ? "bg-violet-600/20 text-white"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                  )}
                  onClick={() => navigate(item)}
                  onMouseEnter={() => setSelected(i)}
                  id={`cmd-result-${i}`}
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg",
                      i === selected ? "bg-violet-500/20" : "bg-white/[0.04]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-3.5 w-3.5",
                        i === selected ? "text-violet-400" : "text-zinc-500"
                      )}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-zinc-600">{item.sub}</p>
                  </div>
                  {i === selected && (
                    <kbd className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-zinc-500">
                      ↵
                    </kbd>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
