import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CompanyEnrichment from "@/models/CompanyEnrichment";
import { getDummyUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    await getDummyUser(); 

    const { id } = await params;

    const enrichments = await CompanyEnrichment.find({ companyId: id }).sort({ createdAt: -1 });
    return NextResponse.json(enrichments);
  } catch (err) {
    console.error("Failed to fetch enrichments:", err);
    return NextResponse.json({ error: "Failed to fetch enrichment history" }, { status: 500 });
  }
}
