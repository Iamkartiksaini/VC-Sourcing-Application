"use client";

import { useState, useMemo } from "react";
import { Download, Plus } from "lucide-react";
import { useApp } from "@/lib/store";
import { FilterBar } from "@/components/FilterBar";
import { CompanyTable } from "@/components/CompanyTable";
import { FilterState } from "@/lib/types";
import { AddCompanyModal } from "@/components/AddCompanyModal";

export default function CompaniesPage() {
  const {
    companies,
    filters,
    setFilters,
    resetFilters,
    saveSearch,
    lists,
    createList,
    addCompanyToList,
    exportCompanies,
    isInitialLoading,
  } = useApp();

  const [addToListTarget, setAddToListTarget] = useState<string | null>(null);
  const [saveSearchModal, setSaveSearchModal] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState("");
  const [newListModal, setNewListModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [addCompanyModal, setAddCompanyModal] = useState(false);

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      if (
        filters.search &&
        !c.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !c.industry.toLowerCase().includes(filters.search.toLowerCase()) &&
        !c.domain.toLowerCase().includes(filters.search.toLowerCase()) &&
        !c.location.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      if (filters.industries.length > 0 && !filters.industries.includes(c.industry))
        return false;
      if (filters.stages.length > 0 && !filters.stages.includes(c.stage))
        return false;
      if (c.employeeCount < filters.minEmployees || c.employeeCount > filters.maxEmployees)
        return false;
      if (filters.minThesisScore > 0 && (c.thesisScore ?? 0) < filters.minThesisScore)
        return false;
      return true;
    });
  }, [companies, filters]);

  const handleSaveSearch = () => {
    if (saveSearchName.trim()) {
      saveSearch(saveSearchName.trim(), filters);
      setSaveSearchName("");
      setSaveSearchModal(false);
    }
  };

  const handleAddToList = (companyId: string) => {
    setAddToListTarget(companyId);
  };

  const handleNewList = () => {
    if (newListName.trim()) {
      const list = createList(newListName.trim(), newListDesc.trim(), "bg-violet-500");
      if (addToListTarget) {
        addCompanyToList(list.id, addToListTarget);
        setAddToListTarget(null);
      }
      setNewListName("");
      setNewListDesc("");
      setNewListModal(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-8 py-5">
        <div>
          <h1 className="text-xl font-semibold text-white">Company Discovery</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Surface high-signal seed companies that match your thesis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCompanies(companies.map((c) => c.id), "csv")}
            className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
            id="export-all-btn"
          >
            <Download className="h-4 w-4" />
            Export All
          </button>
          <button
            onClick={() => setAddCompanyModal(true)}
            className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
            id="add-company-btn"
          >
            <Plus className="h-4 w-4" />
            Add Company
          </button>
          <button
            onClick={() => setNewListModal(true)}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/20"
            id="new-list-btn"
          >
            <Plus className="h-4 w-4" />
            New List
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          onReset={resetFilters}
          onSave={() => setSaveSearchModal(true)}
          resultCount={filtered.length}
        />
        {isInitialLoading ? (
          <div className="flex h-64 items-center justify-center text-zinc-500 text-sm animate-pulse">
            Loading companies...
          </div>
        ) : (
          <CompanyTable
            companies={filtered}
            onExport={exportCompanies}
            onAddToList={handleAddToList}
          />
        )}
      </div>

      {/* Save Search Modal */}
      {saveSearchModal && (
        <Modal title="Save Search" onClose={() => setSaveSearchModal(false)}>
          <p className="text-sm text-zinc-500 mb-4">
            Save your current filter configuration to re-run later.
          </p>
          <input
            autoFocus
            value={saveSearchName}
            onChange={(e) => setSaveSearchName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSaveSearch()}
            placeholder="e.g. India AI Seed"
            className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-violet-500/50 transition-all mb-4"
            id="save-search-name-input"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setSaveSearchModal(false)}
              className="rounded-xl border border-white/[0.06] px-4 py-2 text-sm text-zinc-400 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSearch}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-all"
              id="save-search-confirm-btn"
            >
              Save Search
            </button>
          </div>
        </Modal>
      )}

      {/* Add to List Modal */}
      {addToListTarget && (
        <Modal title="Add to List" onClose={() => setAddToListTarget(null)}>
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {lists.length === 0 && (
              <p className="text-sm text-zinc-600 py-4 text-center">No lists yet.</p>
            )}
            {lists.map((list) => (
              <button
                key={list.id}
                onClick={() => {
                  addCompanyToList(list.id, addToListTarget);
                  setAddToListTarget(null);
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-zinc-300 hover:bg-white/[0.05] hover:text-white transition-all"
                id={`add-to-list-${list.id}`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${list.color}`} />
                {list.name}
                <span className="ml-auto text-xs text-zinc-600">{list.companyIds.length} cos</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => { setAddToListTarget(null); setNewListModal(true); }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-violet-500/30 py-2.5 text-sm text-violet-400 hover:bg-violet-600/10 transition-all"
            id="create-new-list-btn"
          >
            <Plus className="h-4 w-4" />
            Create New List
          </button>
        </Modal>
      )}

      {/* New List Modal */}
      {newListModal && (
        <Modal title="Create New List" onClose={() => setNewListModal(false)}>
          <div className="space-y-3 mb-4">
            <input
              autoFocus
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="List name (e.g. India AI Watch)"
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-violet-500/50 transition-all"
              id="new-list-name-input"
            />
            <input
              value={newListDesc}
              onChange={(e) => setNewListDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-violet-500/50 transition-all"
              id="new-list-desc-input"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setNewListModal(false)}
              className="rounded-xl border border-white/[0.06] px-4 py-2 text-sm text-zinc-400 hover:text-white transition-all"
            >Cancel</button>
            <button
              onClick={handleNewList}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-all"
              id="create-list-confirm-btn"
            >Create</button>
          </div>
        </Modal>
      )}

      {/* Add Company Modal */}
      {addCompanyModal && <AddCompanyModal onClose={() => setAddCompanyModal(false)} />}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#161b22] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-white mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}
