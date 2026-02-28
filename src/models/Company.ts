import mongoose from "mongoose";
import { Company as ICompanyBase } from "@/lib/types";

export interface ICompany extends Omit<ICompanyBase, "id">, mongoose.Document {
    aiSummary?: string;
    aiKeywords?: string[];
    signalTags?: string[];
    thesisScore?: number | null;
    thesisJustification?: string;
    analystNotes?: string;
    lastEnrichedAt?: string;
    lastFundingAmount?: string;
    traction?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CompanySchema = new mongoose.Schema<ICompany>(
    {
        name: { type: String, required: true },
        domain: { type: String, required: true },
        industry: { type: String, required: true },
        stage: { type: String, required: true },
        location: { type: String, required: true },
        foundedYear: { type: Number, required: true },
        employeeCount: { type: Number, required: true },
        description: { type: String, required: true },
        founders: { type: [String], required: true },
        aiSummary: { type: String },
        aiKeywords: { type: [String] },
        signalTags: { type: [String] },
        thesisScore: { type: Number },
        thesisJustification: { type: String },
        analystNotes: { type: String },
        lastEnrichedAt: { type: String },
        lastFundingAmount: { type: String },
        traction: { type: String },
    },
    { timestamps: true }
);

export default mongoose.models.Company || mongoose.model<ICompany>("Company", CompanySchema);
