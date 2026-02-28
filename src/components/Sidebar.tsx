"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  BookmarkCheck,
  Search,
  Cpu,
  ChevronRight,
  Command,
  Layers,
  TrendingUp,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import Image from "next/image";

const NAV_ITEMS = [
  { href: "/companies", label: "Companies", icon: Building2, badge: null },
  { href: "/lists", label: "My Lists", icon: Layers, badge: null },
  { href: "/saved-searches", label: "Saved Searches", icon: BookmarkCheck, badge: null },
];

export function Sidebar() {
  const pathname = usePathname();
  const { companies, lists, setCommandPaletteOpen } = useApp();

  const enrichedCount = companies.filter((c) => c.thesisScore !== undefined && c.aiSummary).length;

  return (
    <aside className="flex h-screen w-60 flex-shrink-0 flex-col border-r border-white/[0.06] bg-[#0d1117]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/[0.06]">
        {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 shadow-lg shadow-violet-500/20"> */}
        {/* <TrendingUp className="h-4 w-4 text-white" /> */}
        <Image className="rounded-lg" src={"/logo.png"} alt="Logo" height={44} width={44} />
        {/* </div> */}
        <div>
          <p className="text-sm font-semibold text-white leading-none">VCScout</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Intelligence Platform</p>
        </div>
      </div>

      {/* Search shortcut */}
      <div className="px-3 pt-4 pb-2">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex w-full items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300 transition-all"
          id="sidebar-search-btn"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="flex items-center gap-0.5 rounded bg-white/[0.08] px-1.5 py-0.5 text-[10px] text-zinc-500">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        <p className="px-2 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Workspace
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all group",
                isActive
                  ? "bg-violet-600/20 text-violet-300"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
              )}
              id={`sidebar-nav-${label.toLowerCase().replace(" ", "-")}`}
            >
              <Icon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-violet-400" : "text-zinc-500 group-hover:text-zinc-300"
                )}
              />
              <span>{label}</span>
              {isActive && (
                <ChevronRight className="ml-auto h-3 w-3 text-violet-400" />
              )}
            </Link>
          );
        })}

        {/* Lists section */}
        {lists.length > 0 && (
          <>
            <p className="px-2 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              My Lists
            </p>
            {lists.slice(0, 5).map((list) => (
              <Link
                key={list.id}
                href={`/lists/${list.id}`}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-all group",
                  pathname === `/lists/${list.id}`
                    ? "bg-white/[0.06] text-white"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                )}
                id={`sidebar-list-${list.id}`}
              >
                <span className={cn("h-2 w-2 rounded-full flex-shrink-0", list.color)} />
                <span className="truncate">{list.name}</span>
                <span className="ml-auto text-xs text-zinc-600">
                  {list.companyIds.length}
                </span>
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Stats Footer */}
      <div className="border-t border-white/[0.06] px-4 py-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-600 flex items-center gap-1.5">
            <Cpu className="h-3 w-3 text-violet-500" />
            AI Enriched
          </span>
          <span className="font-medium text-violet-400">{enrichedCount} / {companies.length}</span>
        </div>
        <div className="w-full h-1 rounded-full bg-white/[0.06]">
          <div
            className="h-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-400 transition-all"
            style={{ width: `${(enrichedCount / companies.length) * 100}%` }}
          />
        </div>
      </div>
    </aside>
  );
}
