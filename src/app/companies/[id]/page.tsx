"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Cpu, Globe, MapPin, Users, Calendar, DollarSign,
  Tag, Zap, BookmarkPlus, Edit3, Check, X, Loader2, TrendingUp,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { ThesisScoreBadge } from "@/components/ThesisScoreBadge";
import { cn } from "@/lib/utils";

const STAGE_COLOR: Record<string, string> = {
  "Pre-Seed": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Seed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Series A": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Series B+": "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { companies, lists, updateCompany, addCompanyToList, createList } = useApp();
  const router = useRouter();

  const company = companies.find((c) => c.id === id);

  const [enriching, setEnriching] = useState(false);
  const [enrichError, setEnrichError] = useState("");
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(company?.notes ?? "");
  const [showListPicker, setShowListPicker] = useState(false);
  const [newListName, setNewListName] = useState("");

  const [enrichmentHistory, setEnrichmentHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (company) {
      fetch(`/api/companies/${id}/enrichments`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setEnrichmentHistory(data);
          }
        })
        .finally(() => setLoadingHistory(false));
    }
  }, [id, company]);

  if (!company) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 mb-3">Company not found</p>
          <button
            onClick={() => router.push("/companies")}
            className="text-violet-400 hover:text-violet-300 text-sm"
          >
            ← Back to companies
          </button>
        </div>
      </div>
    );
  }

  const handleEnrich = async () => {
    setEnriching(true);
    setEnrichError("");
    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: company.id,
          domain: company.domain,
          companyName: company.name,
          description: company.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Enrichment failed");
      updateCompany({
        ...company,
        aiSummary: data.summary,
        aiKeywords: data.keywords,
        aiSignals: data.signals,
        thesisScore: data.thesisScore,
        thesisJustification: data.thesisJustification,
      });

      // After a successful enrichment, fetch the updated history to show immediately
      fetch(`/api/companies/${id}/enrichments`)
        .then(res => res.json())
        .then(data => Array.isArray(data) && setEnrichmentHistory(data));

    } catch (err) {
      setEnrichError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setEnriching(false);
    }
  };

  const handleSaveNotes = () => {
    updateCompany({ ...company, notes: notesValue });
    setEditingNotes(false);
  };

  const handleAddToList = (listId: string) => {
    addCompanyToList(listId, company.id);
    setShowListPicker(false);
  };

  const handleCreateAndAdd = () => {
    if (newListName.trim()) {
      const list = createList(newListName.trim(), "", "bg-violet-500");
      addCompanyToList(list.id, company.id);
      setNewListName("");
      setShowListPicker(false);
    }
  };

  const savedInLists = lists.filter((l) => l.companyIds.includes(company.id));

  return (
    <div className="max-w-4xl mx-auto px-8 py-8 space-y-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
        id="back-btn"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Header Card */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-900/60 to-indigo-900/60 border border-white/[0.08] text-2xl font-bold text-violet-300">
              {company.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{company.name}</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <a
                  href={`https://${company.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                  id="company-domain-link"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {company.domain}
                </a>
                <span className="text-zinc-700">·</span>
                <span className="flex items-center gap-1 text-sm text-zinc-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {company.location}
                </span>
                <span className="text-zinc-700">·</span>
                <span
                  className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", STAGE_COLOR[company.stage])}
                >
                  {company.stage}
                </span>
              </div>
              {savedInLists.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {savedInLists.map((l) => (
                    <span
                      key={l.id}
                      className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-xs text-zinc-500"
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", l.color)} />
                      {l.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              {/* Save to List */}
              <div className="relative">
                <button
                  onClick={() => setShowListPicker(!showListPicker)}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all"
                  id="save-to-list-btn"
                >
                  <BookmarkPlus className="h-4 w-4" />
                  Save to List
                </button>
                {showListPicker && (
                  <div
                    className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/[0.08] bg-[#161b22] shadow-2xl z-10 p-2 space-y-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {lists.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => handleAddToList(l.id)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-all"
                        id={`add-to-list-picker-${l.id}`}
                      >
                        <span className={cn("h-2 w-2 rounded-full", l.color)} />
                        {l.name}
                        {l.companyIds.includes(company.id) && <Check className="h-3.5 w-3.5 ml-auto text-emerald-400" />}
                      </button>
                    ))}
                    <div className="pt-1 border-t border-white/[0.06]">
                      <input
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreateAndAdd()}
                        placeholder="New list name..."
                        className="w-full rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-violet-500/50"
                        id="new-list-name-picker-input"
                      />
                      {newListName && (
                        <button
                          onClick={handleCreateAndAdd}
                          className="mt-1.5 w-full rounded-lg bg-violet-600/20 border border-violet-500/30 py-1.5 text-xs text-violet-400 hover:bg-violet-600/30 transition-all"
                        >
                          Create "{newListName}"
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Enrich */}
              <button
                onClick={handleEnrich}
                disabled={enriching}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
                  enriching
                    ? "bg-violet-600/30 text-violet-400 cursor-not-allowed"
                    : "bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20"
                )}
                id="enrich-btn"
              >
                {enriching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Cpu className="h-4 w-4" />
                )}
                {enriching ? "Enriching..." : company.aiSummary ? "Re-Enrich" : "AI Enrich"}
              </button>
            </div>
            {company.enrichedAt && (
              <p className="text-[10px] text-zinc-600">
                Last enriched {new Date(company.enrichedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {enrichError && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
            <X className="h-4 w-4" />
            {enrichError}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard icon={Users} label="Team Size" value={`${company.employeeCount} people`} />
        <MetricCard icon={Calendar} label="Founded" value={String(company.foundedYear)} />
        <MetricCard
          icon={DollarSign}
          label="Last Funding"
          value={company.lastFundingAmount ?? "Undisclosed"}
        />
      </div>

      {/* Description + Traction */}
      <div className="grid grid-cols-2 gap-4">
        <SectionCard title="About">
          <p className="text-sm text-zinc-400 leading-relaxed">{company.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {company.founders.map((f) => (
              <span
                key={f}
                className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-400"
              >
                👤 {f}
              </span>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Traction">
          <p className="text-sm text-zinc-400 leading-relaxed">
            {company.traction ?? "No traction data available."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {company.signalTags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs text-violet-400"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* AI Enrichment Results */}
      {company.aiSummary && (
        <SectionCard
          title="AI Intelligence"
          badge={
            <span className="flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs text-violet-400">
              <Cpu className="h-3 w-3" />
              AI Enriched
            </span>
          }
        >
          <div className="space-y-5">
            {/* Summary */}
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-600">
                AI Summary
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">{company.aiSummary}</p>
            </div>

            {/* Thesis Score */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">
                Thesis Fit Score
              </p>
              <ThesisScoreBadge score={company.thesisScore} size="lg" />
              {company.thesisJustification && (
                <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                  {company.thesisJustification}
                </p>
              )}
            </div>

            {/* Signals */}
            {company.aiSignals && company.aiSignals.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">
                  Investor Signals
                </p>
                <ul className="space-y-2">
                  {company.aiSignals.map((signal, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                      <Zap className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-amber-400" />
                      {signal}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Keywords */}
            {company.aiKeywords && company.aiKeywords.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">
                  Keywords
                </p>
                <div className="flex flex-wrap gap-2">
                  {company.aiKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-400"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* Enrichment History */}
      {!loadingHistory && enrichmentHistory.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white px-2">Enrichment History ({enrichmentHistory.length})</h3>
          <div className="space-y-4">
            {enrichmentHistory.map((historyItem) => (
              <SectionCard
                key={historyItem._id}
                title={new Date(historyItem.enrichedAt).toLocaleString()}
                badge={<span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold px-2 py-1 bg-white/[0.04] border border-white/[0.06] rounded-full">Score: {historyItem.thesisScore}</span>}
              >
                <div className="space-y-4">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-600">Summary</p>
                    <p className="text-sm text-zinc-400 leading-relaxed">{historyItem.summary}</p>
                  </div>
                  {(historyItem.signals?.length > 0) && (
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-600">Signals</p>
                      <ul className="space-y-1">
                        {historyItem.signals.map((sig: string, i: number) => (
                          <li key={i} className="text-xs text-zinc-400 flex items-start gap-1.5"><Zap className="h-3 w-3 mt-0.5 text-amber-500/70" /> {sig}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(historyItem.keywords?.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {historyItem.keywords.map((kw: string) => (
                        <span key={kw} className="text-[10px] px-2 py-0.5 rounded-full border border-white/[0.04] bg-white/[0.02] text-zinc-500">{kw}</span>
                      ))}
                    </div>
                  )}
                </div>
              </SectionCard>
            ))}
          </div>
        </div>
      )}

      {/* No AI yet CTA */}
      {!company.aiSummary && (
        <div className="rounded-2xl border border-dashed border-violet-500/20 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600/10 border border-violet-500/20">
            <Cpu className="h-6 w-6 text-violet-400" />
          </div>
          <p className="text-white font-medium mb-1">No AI enrichment yet</p>
          <p className="text-sm text-zinc-500 mb-4">
            Click "AI Enrich" to generate thesis scoring, investor signals, and a sharp summary.
          </p>
          <button
            onClick={handleEnrich}
            disabled={enriching}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-all"
            id="enrich-cta-btn"
          >
            {enriching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cpu className="h-4 w-4" />}
            {enriching ? "Enriching..." : "Run AI Enrichment"}
          </button>
        </div>
      )}

      {/* Notes */}
      <SectionCard
        title="Analyst Notes"
        badge={
          !editingNotes ? (
            <button
              onClick={() => setEditingNotes(true)}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              id="edit-notes-btn"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveNotes}
                className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300"
                id="save-notes-btn"
              >
                <Check className="h-3.5 w-3.5" />
                Save
              </button>
              <button
                onClick={() => { setEditingNotes(false); setNotesValue(company.notes ?? ""); }}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300"
                id="cancel-notes-btn"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            </div>
          )
        }
      >
        {editingNotes ? (
          <textarea
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            rows={5}
            autoFocus
            placeholder="Add your analyst notes, observations, or due diligence points..."
            className="w-full bg-white/[0.03] border border-violet-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none resize-none focus:border-violet-500/60 transition-all"
            id="notes-textarea"
          />
        ) : (
          <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap min-h-[60px]">
            {company.notes || (
              <span className="text-zinc-600 italic">No notes yet. Click Edit to add your observations.</span>
            )}
          </p>
        )}
      </SectionCard>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-zinc-600" />
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">{label}</p>
      </div>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function SectionCard({
  title,
  children,
  badge,
}: {
  title: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {badge}
      </div>
      {children}
    </div>
  );
}
