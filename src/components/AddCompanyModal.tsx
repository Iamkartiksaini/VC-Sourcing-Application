"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Sparkles, Loader2, Link as LinkIcon } from "lucide-react";
import { useApp } from "@/lib/store";
import { Company, Industry, Stage } from "@/lib/types";

const ALL_INDUSTRIES: Industry[] = [
  "B2B SaaS", "Fintech", "AI/ML", "HealthTech", "EdTech",
  "CleanTech", "Consumer", "DeepTech", "Marketplace",
];

const ALL_STAGES: Stage[] = ["Pre-Seed", "Seed", "Series A", "Series B+"];

const formSchema = z.object({
  name: z.string().min(1, "Required"),
  domain: z.string().min(1, "Required"),
  industry: z.enum(["B2B SaaS", "Fintech", "AI/ML", "HealthTech", "EdTech", "CleanTech", "Consumer", "DeepTech", "Marketplace"] as const),
  stage: z.enum(["Pre-Seed", "Seed", "Series A", "Series B+"] as const),
  location: z.string().min(1, "Required"),
  foundedYear: z.coerce.number().int().positive(),
  employeeCount: z.coerce.number().int().nonnegative(),
  description: z.string().min(5, "Required"),
  founders: z.string().min(1, "Required"),
  lastFundingAmount: z.string().optional(),
  traction: z.string().optional(),
  signalTags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddCompanyModal({ onClose }: { onClose: () => void }) {
  const { addCompany } = useApp();
  const [magicInput, setMagicInput] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      foundedYear: new Date().getFullYear(),
      employeeCount: 1,
      industry: "B2B SaaS",
      stage: "Seed",
      founders: "",
      signalTags: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    const foundersArray = data.founders.split(",").map((s) => s.trim()).filter(Boolean);
    const signalsArray = data.signalTags ? data.signalTags.split(",").map((s) => s.trim()).filter(Boolean) : [];

    const newCompany: Omit<Company, "id"> = {
      name: data.name,
      domain: data.domain,
      industry: data.industry as Industry,
      stage: data.stage as Stage,
      location: data.location,
      foundedYear: data.foundedYear,
      employeeCount: data.employeeCount,
      description: data.description,
      founders: foundersArray,
      lastFundingAmount: data.lastFundingAmount,
      traction: data.traction,
      signalTags: signalsArray,
    };

    addCompany(newCompany);
    onClose();
  };

  const handleMagicExtract = async () => {
    if (!magicInput.trim()) return;
    setExtracting(true);
    setExtractError("");

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: magicInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed");
      
      if (data.name) setValue("name", data.name, { shouldValidate: true });
      if (data.domain) setValue("domain", data.domain, { shouldValidate: true });
      if (data.industry && ALL_INDUSTRIES.includes(data.industry)) setValue("industry", data.industry);
      if (data.stage && ALL_STAGES.includes(data.stage)) setValue("stage", data.stage);
      if (data.location) setValue("location", data.location, { shouldValidate: true });
      if (data.foundedYear) setValue("foundedYear", data.foundedYear);
      if (data.employeeCount !== undefined) setValue("employeeCount", data.employeeCount);
      if (data.description) setValue("description", data.description, { shouldValidate: true });
      if (data.founders) setValue("founders", (Array.isArray(data.founders) ? data.founders : []).join(", "), { shouldValidate: true });
      if (data.lastFundingAmount) setValue("lastFundingAmount", data.lastFundingAmount);
      if (data.traction) setValue("traction", data.traction);
      if (data.signalTags) setValue("signalTags", (Array.isArray(data.signalTags) ? data.signalTags : []).join(", "));
      
      setMagicInput("");
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : "Failed to extract");
    } finally {
      setExtracting(false);
    }
  };

  const InputRow = ({ label, id, error, children }: any) => (
    <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{label}</label>
      {children}
      {error && <p className="text-[10px] text-rose-400">{error.message}</p>}
    </div>
  );

  const inputClass = "w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-violet-500/50 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
      <div 
        className="w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-[#161b22] shadow-2xl my-8 relative flex flex-col max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4 flex-shrink-0 sticky top-0 bg-[#161b22] z-10 rounded-t-2xl">
          <h2 className="text-lg font-bold text-white">Add New Company</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors" id="close-add-modal-btn">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto space-y-8 flex-1">
          {/* Magic Extract Section */}
          <div className="rounded-xl border border-violet-500/30 bg-violet-600/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <p className="text-sm font-semibold text-white">AI Magic Fill</p>
            </div>
            <p className="text-xs text-zinc-400 mb-3">Paste a company website URL or a block of text (like a news article) and our AI will extract the structured data to fill the form instantly.</p>
            
            <div className="flex gap-2 relative">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  value={magicInput}
                  onChange={(e) => setMagicInput(e.target.value)}
                  placeholder="Paste URL or text details..."
                  className="w-full rounded-xl border border-white/[0.06] bg-black/40 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-violet-500/50 transition-all"
                  onKeyDown={e => e.key === 'Enter' && handleMagicExtract()}
                  disabled={extracting}
                  id="magic-fill-input"
                />
              </div>
              <button
                onClick={handleMagicExtract}
                disabled={extracting || !magicInput.trim()}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                id="magic-fill-submit"
              >
                {extracting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Extract"}
              </button>
            </div>
            {extractError && <p className="text-xs text-rose-400 mt-2">{extractError}</p>}
          </div>

          <hr className="border-white/[0.06]" />

          {/* Form */}
          <form id="add-company-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-4">
            <div className="flex flex-wrap gap-4">
              <InputRow label="Company Name *" id="name" error={errors.name}>
                <input id="name" {...register("name")} className={inputClass} placeholder="Acme Corp" />
              </InputRow>
              <InputRow label="Website Domain *" id="domain" error={errors.domain}>
                <input id="domain" {...register("domain")} className={inputClass} placeholder="acme.co" />
              </InputRow>
            </div>

            <div className="flex flex-wrap gap-4">
              <InputRow label="Industry *" id="industry" error={errors.industry}>
                <select id="industry" {...register("industry")} className={inputClass}>
                  {ALL_INDUSTRIES.map(i => <option key={i} value={i} className="bg-[#161b22]">{i}</option>)}
                </select>
              </InputRow>
              <InputRow label="Stage *" id="stage" error={errors.stage}>
                <select id="stage" {...register("stage")} className={inputClass}>
                  {ALL_STAGES.map(s => <option key={s} value={s} className="bg-[#161b22]">{s}</option>)}
                </select>
              </InputRow>
            </div>

            <div className="flex flex-wrap gap-4">
              <InputRow label="Location *" id="location" error={errors.location}>
                <input id="location" {...register("location")} className={inputClass} placeholder="Bengaluru, India" />
              </InputRow>
              <InputRow label="Employees" id="employeeCount" error={errors.employeeCount}>
                <input id="employeeCount" type="number" {...register("employeeCount")} className={inputClass} />
              </InputRow>
              <InputRow label="Founded Year" id="foundedYear" error={errors.foundedYear}>
                <input id="foundedYear" type="number" {...register("foundedYear")} className={inputClass} />
              </InputRow>
            </div>

            <InputRow label="Description *" id="description" error={errors.description}>
              <textarea id="description" {...register("description")} className={inputClass} rows={3} placeholder="Briefly describe what they do..." />
            </InputRow>

            <InputRow label="Founders (comma separated) *" id="founders" error={errors.founders}>
              <input id="founders" {...register("founders")} className={inputClass} placeholder="Alice Smith, Bob Jones" />
            </InputRow>

            <div className="flex flex-wrap gap-4">
              <InputRow label="Last Funding" id="lastFundingAmount" error={errors.lastFundingAmount}>
                <input id="lastFundingAmount" {...register("lastFundingAmount")} className={inputClass} placeholder="$2.5M" />
              </InputRow>
              <InputRow label="Traction" id="traction" error={errors.traction}>
                <input id="traction" {...register("traction")} className={inputClass} placeholder="10k DAU, $1m ARR..." />
              </InputRow>
            </div>
            
            <InputRow label="Signal Tags (comma separated)" id="signalTags" error={errors.signalTags}>
              <input id="signalTags" {...register("signalTags")} className={inputClass} placeholder="B2B, ML, YC S23" />
            </InputRow>

          </form>
        </div>

        <div className="px-6 py-4 border-t border-white/[0.06] bg-black/20 flex justify-end gap-3 flex-shrink-0 rounded-b-2xl">
          <button type="button" onClick={onClose} className="rounded-xl border border-white/[0.06] px-5 py-2.5 text-sm text-zinc-400 hover:text-white transition-all">
            Cancel
          </button>
          <button type="submit" form="add-company-form" className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/20" id="add-company-submit">
            Add Company
          </button>
        </div>
      </div>
    </div>
  );
}
