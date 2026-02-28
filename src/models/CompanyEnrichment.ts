import mongoose from "mongoose";

export interface ICompanyEnrichment extends mongoose.Document {
    companyId: mongoose.Types.ObjectId;
    summary: string;
    keywords: string[];
    signals: string[];
    thesisScore: number;
    thesisJustification: string;
    enrichedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const CompanyEnrichmentSchema = new mongoose.Schema<ICompanyEnrichment>(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },
        summary: { type: String, required: true },
        keywords: { type: [String], default: [] },
        signals: { type: [String], default: [] },
        thesisScore: { type: Number, required: true },
        thesisJustification: { type: String, required: true },
        enrichedAt: { type: Date, required: true, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.models.CompanyEnrichment || mongoose.model<ICompanyEnrichment>("CompanyEnrichment", CompanyEnrichmentSchema);
