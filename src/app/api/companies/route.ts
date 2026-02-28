import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Company from "@/models/Company";
import { z } from "zod";
import { getDummyUser } from "@/lib/auth";
import { seedDatabase } from "@/lib/seed";

const companySchema = z.object({
    name: z.string().min(1),
    domain: z.string().min(1),
    industry: z.string().min(1),
    stage: z.string().min(1),
    location: z.string().min(1),
    foundedYear: z.number().int().positive(),
    employeeCount: z.number().int().nonnegative(),
    description: z.string().min(5),
    founders: z.array(z.string()).min(1),
    lastFundingAmount: z.string().optional(),
    traction: z.string().optional(),
    signalTags: z.array(z.string()).optional(),

    aiSummary: z.string().optional(),
    aiKeywords: z.array(z.string()).optional(),
    thesisScore: z.number().optional().nullable(),
    thesisJustification: z.string().optional(),
    analystNotes: z.string().optional(),
    lastEnrichedAt: z.string().optional(),
});

export async function GET() {
    try {
        // Seed DB if empty before fetching to ensure dummy data exists
        await seedDatabase();

        await dbConnect();
        // Return newest entries first as requested
        const companies = await Company.find({}).sort({ createdAt: -1 });
        return NextResponse.json(companies);
    } catch (err) {
        console.error("Failed to fetch companies:", err);
        return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        // Verify dummy user exists just for auth simulation
        await getDummyUser();

        const body = await req.json();
        const validated = companySchema.parse(body);

        const company = await Company.create(validated);
        return NextResponse.json(company, { status: 201 });
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation failed", details: err.errors }, { status: 400 });
        }
        console.error("Failed to create company:", err);
        return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
    }
}
