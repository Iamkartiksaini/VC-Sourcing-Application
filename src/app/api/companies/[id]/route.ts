import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Company from "@/models/Company";
import { z } from "zod";
import { getDummyUser } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  domain: z.string().min(1).optional(),
  industry: z.string().min(1).optional(),
  stage: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  foundedYear: z.number().int().positive().optional(),
  employeeCount: z.number().int().nonnegative().optional(),
  description: z.string().min(5).optional(),
  founders: z.array(z.string()).min(1).optional(),
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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    await getDummyUser();
    
    const { id } = await params;
    const body = await req.json();
    const validated = updateSchema.parse(body);

    const updated = await Company.findByIdAndUpdate(id, validated, { new: true, runValidators: true });
    
    if (!updated) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    
    return NextResponse.json(updated);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.errors }, { status: 400 });
    }
    console.error("Failed to update company:", err);
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
  }
}
