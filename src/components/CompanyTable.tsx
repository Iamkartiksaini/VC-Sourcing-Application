"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight,
  ExternalLink, Cpu, CheckSquare, Square, Download, MoreHorizontal,
} from "lucide-react";
import { Company } from "@/lib/types";
import { ThesisScoreBadge } from "./ThesisScoreBadge";
import { cn } from "@/lib/utils";

type SortKey = keyof Pick<
  Company,
  "name" | "industry" | "stage" | "employeeCount" | "foundedYear" | "thesisScore"
>;

interface CompanyTableProps {
  companies: Company[];
  onExport: (ids: string[], format: "csv" | "json") => void;
  onAddToList: (companyId: string) => void;
}

const PAGE_SIZE = 10;

const STAGE_COLOR: Record<string, string> = {
  "Pre-Seed": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Seed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Series A": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Series B+": "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

export function CompanyTable({ companies, onExport, onAddToList }: CompanyTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("thesisScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showExportMenu, setShowExportMenu] = useState(false);

  const sorted = companies;
  // const sorted = [...companies].sort((a, b) => {
  //   const av = a[sortKey] ?? 0;
  //   const bv = b[sortKey] ?? 0;
  //   const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
  //   return sortDir === "asc" ? cmp : -cmp;
  // });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
    ) : (
      <ArrowUpDown className="h-3 w-3 opacity-30" />
    );

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map((c) => c.id)));
  };

  const exportIds = selected.size > 0 ? [...selected] : companies.map((c) => c.id);

  return (
    <div className="flex flex-col gap-3">
      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-violet-500/20 bg-violet-600/10 px-4 py-2.5">
          <span className="text-sm text-violet-300 font-medium">
            {selected.size} selected
          </span>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => { selected.forEach((id) => onAddToList(id)); }}
              className="rounded-lg bg-violet-600/20 border border-violet-500/30 px-3 py-1.5 text-xs text-violet-300 hover:bg-violet-600/30 transition-all"
              id="bulk-add-to-list-btn"
            >
              Add to List
            </button>
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-all"
                id="bulk-export-btn"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 rounded-xl border border-white/[0.06] bg-[#161b22] z-10 overflow-hidden shadow-xl">
                  <button
                    onClick={() => { onExport(exportIds, "csv"); setShowExportMenu(false); }}
                    className="block w-full px-4 py-2.5 text-left text-sm text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                    id="export-csv-btn"
                  >as CSV</button>
                  <button
                    onClick={() => { onExport(exportIds, "json"); setShowExportMenu(false); }}
                    className="block w-full px-4 py-2.5 text-left text-sm text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                    id="export-json-btn"
                  >as JSON</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              <th className="w-10 px-4 py-3">
                <button onClick={toggleAll} id="select-all-btn">
                  {selected.size === paginated.length && paginated.length > 0 ? (
                    <CheckSquare className="h-4 w-4 text-violet-400" />
                  ) : (
                    <Square className="h-4 w-4 text-zinc-600" />
                  )}
                </button>
              </th>
              {[
                { key: "name" as SortKey, label: "Company" },
                { key: "industry" as SortKey, label: "Industry" },
                { key: "stage" as SortKey, label: "Stage" },
                { key: "employeeCount" as SortKey, label: "Team" },
                { key: "foundedYear" as SortKey, label: "Founded" },
                { key: "thesisScore" as SortKey, label: "Thesis Score" },
              ].map(({ key, label }) => (
                <th key={key} className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort(key)}
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors"
                    id={`sort-${key}-btn`}
                  >
                    {label}
                    <SortIcon k={key} />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {paginated.map((company) => (
              <tr
                key={company.id}
                className={cn(
                  "border-b border-white/[0.04] transition-colors group",
                  selected.has(company.id)
                    ? "bg-violet-600/5"
                    : "hover:bg-white/[0.02]"
                )}
              >
                <td className="px-4 py-3">
                  <button onClick={() => toggleSelect(company.id)} id={`select-${company.id}`}>
                    {selected.has(company.id) ? (
                      <CheckSquare className="h-4 w-4 text-violet-400" />
                    ) : (
                      <Square className="h-4 w-4 text-zinc-700 group-hover:text-zinc-500" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/companies/${company.id}`} id={`company-row-${company.id}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-900/40 to-indigo-900/40 border border-white/[0.06] text-xs font-bold text-violet-400">
                        {company.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white hover:text-violet-300 transition-colors">
                          {company.name}
                        </p>
                        <p className="text-xs text-zinc-600">{company.domain}</p>
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-400">
                    {company.industry}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-medium",
                      STAGE_COLOR[company.stage]
                    )}
                  >
                    {company.stage}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400 tabular-nums">
                  {company.employeeCount}
                </td>
                <td className="px-4 py-3 text-zinc-400 tabular-nums">
                  {company.foundedYear}
                </td>
                <td className="px-4 py-3">
                  <ThesisScoreBadge score={company.thesisScore} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {company.aiSummary && (
                      <span title="AI Enriched">
                        <Cpu className="h-3.5 w-3.5 text-violet-500" />
                      </span>
                    )}
                    <Link
                      href={`/companies/${company.id}`}
                      className="ml-1 rounded-lg bg-white/[0.04] p-1.5 text-zinc-600 hover:text-white hover:bg-white/[0.08] transition-all"
                      id={`company-link-${company.id}`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginated.length === 0 && (
          <div className="py-16 text-center text-zinc-600">
            <p className="text-lg mb-1">No companies match</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-xs text-zinc-600">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, companies.length)} of {companies.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-1.5 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              id="pagination-prev"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - page) <= 2)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                    p === page
                      ? "border-violet-500/40 bg-violet-600/20 text-violet-300"
                      : "border-white/[0.06] bg-white/[0.03] text-zinc-500 hover:text-white"
                  )}
                  id={`pagination-page-${p}`}
                >
                  {p}
                </button>
              ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-1.5 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              id="pagination-next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
