"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Company, SavedList, SavedSearch, FilterState, DEFAULT_FILTERS } from "./types";

interface AppState {
  companies: Company[];
  lists: SavedList[];
  savedSearches: SavedSearch[];
  filters: FilterState;
  commandPaletteOpen: boolean;
  isInitialLoading: boolean;
}

interface AppActions {
  updateCompany: (updated: Company) => Promise<void>;
  addCompany: (company: Omit<Company, "id">) => Promise<Company>;
  createList: (name: string, description: string, color: string) => Promise<SavedList>;
  deleteList: (id: string) => Promise<void>;
  addCompanyToList: (listId: string, companyId: string) => Promise<void>;
  removeCompanyFromList: (listId: string, companyId: string) => Promise<void>;
  saveSearch: (name: string, filters: FilterState) => Promise<void>;
  deleteSavedSearch: (id: string) => Promise<void>;
  setFilters: (f: FilterState) => void;
  resetFilters: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  exportCompanies: (ids: string[], format: "csv" | "json") => void;
}

type AppContextType = AppState & AppActions;

const AppContext = createContext<AppContextType | null>(null);

const LIST_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [lists, setLists] = useState<SavedList[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [filters, setFiltersState] = useState<FilterState>(DEFAULT_FILTERS);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Initial Data Fetch
  useEffect(() => {
    async function initData() {
      try {
        const [companiesRes, listsRes, searchesRes] = await Promise.all([
          fetch("/api/companies"),
          fetch("/api/lists"),
          fetch("/api/saved-searches"),
        ]);

        if (companiesRes.ok) {
          const data = await companiesRes.json();
          // Map MongoDB _id to frontend id
          setCompanies(data.map((c: any) => ({ ...c, id: c._id })));
        }
        if (listsRes.ok) {
          const data = await listsRes.json();
          setLists(data.map((l: any) => ({ ...l, id: l._id })));
        }
        if (searchesRes.ok) {
          const data = await searchesRes.json();
          setSavedSearches(data.map((s: any) => ({ ...s, id: s._id })));
        }
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
      } finally {
        setIsInitialLoading(false);
      }
    }
    initData();
  }, []);

  const updateCompany = useCallback(async (updated: Company) => {
    try {
      // Optimistic update
      setCompanies((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));

      const { id, _id, createdAt, updatedAt, __v, ...data } = updated as any;
      await fetch(`/api/companies/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.error("Failed to update company:", err);
      // In a real app, we'd roll back here
    }
  }, []);

  const addCompany = useCallback(async (companyData: Omit<Company, "id">): Promise<Company> => {
    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(companyData),
    });
    if (!res.ok) throw new Error("Failed to create company");
    const data = await res.json();
    const newCompany = { ...data, id: data._id };
    setCompanies((prev) => [newCompany, ...prev]);
    return newCompany;
  }, []);

  const createList = useCallback(
    async (name: string, description: string, color: string): Promise<SavedList> => {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          color: color || LIST_COLORS[Math.floor(Math.random() * LIST_COLORS.length)],
        }),
      });
      if (!res.ok) throw new Error("Failed to create list");
      const data = await res.json();
      const newList = { ...data, id: data._id };
      setLists((prev) => [newList, ...prev]);
      return newList;
    },
    []
  );

  const deleteList = useCallback(async (id: string) => {
    setLists((prev) => prev.filter((l) => l.id !== id));
    await fetch(`/api/lists/${id}`, { method: "DELETE" });
  }, []);

  const addCompanyToList = useCallback(async (listId: string, companyId: string) => {
    const list = lists.find((l) => l.id === listId);
    if (!list || list.companyIds.includes(companyId)) return;

    const newIds = [...list.companyIds, companyId];
    setLists((prev) => prev.map((l) => (l.id === listId ? { ...l, companyIds: newIds } : l)));

    await fetch(`/api/lists/${listId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyIds: newIds }),
    });
  }, [lists]);

  const removeCompanyFromList = useCallback(
    async (listId: string, companyId: string) => {
      const list = lists.find((l) => l.id === listId);
      if (!list) return;

      const newIds = list.companyIds.filter((id) => id !== companyId);
      setLists((prev) => prev.map((l) => (l.id === listId ? { ...l, companyIds: newIds } : l)));

      await fetch(`/api/lists/${listId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyIds: newIds }),
      });
    },
    [lists]
  );

  const saveSearch = useCallback(async (name: string, filters: FilterState) => {
    const res = await fetch("/api/saved-searches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, filters }),
    });
    if (res.ok) {
      const data = await res.json();
      setSavedSearches((prev) => [{ ...data, id: data._id }, ...prev]);
    }
  }, []);

  const deleteSavedSearch = useCallback(async (id: string) => {
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
    await fetch(`/api/saved-searches/${id}`, { method: "DELETE" });
  }, []);

  const setFilters = useCallback((f: FilterState) => setFiltersState(f), []);
  const resetFilters = useCallback(() => setFiltersState(DEFAULT_FILTERS), []);

  const exportCompanies = useCallback(
    (ids: string[], format: "csv" | "json") => {
      const data = companies.filter((c) => ids.includes(c.id));
      let content: string;
      let filename: string;
      if (format === "json") {
        content = JSON.stringify(data, null, 2);
        filename = "vc_companies.json";
      } else {
        const headers = [
          "Name", "Domain", "Industry", "Stage", "Location", "Founded", "Employees",
          "Description", "Thesis Score", "Traction",
        ];
        const rows = data.map((c) =>
          [
            c.name, c.domain, c.industry, c.stage, c.location, c.foundedYear,
            c.employeeCount, `"${c.description}"`, c.thesisScore ?? "", c.traction ?? "",
          ].join(",")
        );
        content = [headers.join(","), ...rows].join("\n");
        filename = "vc_companies.csv";
      }
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    [companies]
  );

  return (
    <AppContext.Provider
      value={{
        companies, lists, savedSearches, filters, commandPaletteOpen, isInitialLoading,
        updateCompany, addCompany, createList, deleteList, addCompanyToList, removeCompanyFromList,
        saveSearch, deleteSavedSearch, setFilters, resetFilters, setCommandPaletteOpen,
        exportCompanies,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
