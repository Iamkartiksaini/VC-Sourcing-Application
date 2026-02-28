export type Stage = "Pre-Seed" | "Seed" | "Series A" | "Series B+";
export type Industry =
  | "B2B SaaS"
  | "Fintech"
  | "AI/ML"
  | "HealthTech"
  | "EdTech"
  | "CleanTech"
  | "Consumer"
  | "DeepTech"
  | "Marketplace";

export interface Company {
  id: string;
  name: string;
  domain: string;
  industry: Industry;
  stage: Stage;
  location: string;
  foundedYear: number;
  employeeCount: number;
  description: string;
  founders: string[];
  lastFundingAmount?: string;
  traction?: string;
  signalTags: string[];
  thesisScore?: number;
  thesisJustification?: string;
  aiSummary?: string;
  aiKeywords?: string[];
  aiSignals?: string[];
  notes?: string;
  enrichedAt?: string;
}

export interface SavedList {
  id: string;
  name: string;
  description: string;
  companyIds: string[];
  createdAt: string;
  color: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: FilterState;
  createdAt: string;
}

export interface FilterState {
  search: string;
  industries: Industry[];
  stages: Stage[];
  minEmployees: number;
  maxEmployees: number;
  locations: string[];
  minThesisScore: number;
}

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  industries: [],
  stages: [],
  minEmployees: 0,
  maxEmployees: 10000,
  locations: [],
  minThesisScore: 0,
};
