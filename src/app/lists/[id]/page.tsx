"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, ExternalLink, Trash2, Download } from "lucide-react";
import { useApp } from "@/lib/store";
import { ThesisScoreBadge } from "@/components/ThesisScoreBadge";
import { cn } from "@/lib/utils";

export default function ListDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { lists, companies, removeCompanyFromList, exportCompanies } = useApp();
  const router = useRouter();

  const list = lists.find((l) => l.id === id);
  const listCompanies = list ? companies.filter((c) => list.companyIds.includes(c.id)) : [];

  if (!list) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 mb-3">List not found</p>
          <button onClick={() => router.push("/lists")} className="text-violet-400 text-sm">
            ← Back to lists
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-8 py-5">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-zinc-600 hover:text-white transition-colors" id="list-detail-back-btn">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <span className={cn("h-3 w-3 rounded-full", list.color)} />
            <h1 className="text-xl font-semibold text-white">{list.name}</h1>
            <span className="text-sm text-zinc-600">({listCompanies.length})</span>
          </div>
        </div>
        {listCompanies.length > 0 && (
          <button
            onClick={() => exportCompanies(list.companyIds, "csv")}
            className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
            id="list-detail-export-btn"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {listCompanies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Building2 className="h-12 w-12 text-zinc-700 mb-4" />
            <p className="text-zinc-500">No companies in this list yet.</p>
            <Link href="/companies" className="mt-3 text-sm text-violet-400 hover:text-violet-300">
              Browse companies →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {listCompanies.map((company) => (
              <div
                key={company.id}
                className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 hover:bg-white/[0.04] transition-all group"
                id={`list-detail-company-${company.id}`}
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-sm font-bold text-violet-400">
                  {company.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{company.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{company.industry} · {company.location}</p>
                </div>
                <ThesisScoreBadge score={company.thesisScore} />
                <Link
                  href={`/companies/${company.id}`}
                  className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-zinc-600 hover:text-white hover:bg-white/[0.06] transition-all"
                  id={`list-detail-open-${company.id}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => removeCompanyFromList(list.id, company.id)}
                  className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                  id={`list-detail-remove-${company.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
