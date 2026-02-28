import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SavedSearch from "@/models/SavedSearch";
import { z } from "zod";
import { getDummyUser } from "@/lib/auth";

const searchSchema = z.object({
  name: z.string().min(1),
  filters: z.object({
    search: z.string().optional(),
    industries: z.array(z.string()),
    stages: z.array(z.string()),
    minEmployees: z.number().int(),
    maxEmployees: z.number().int(),
    minThesisScore: z.number().int(),
  }),
});

export async function GET() {
  try {
    await dbConnect();
    const user = await getDummyUser();
    const searches = await SavedSearch.find({ userId: user._id }).sort({ createdAt: -1 });
    return NextResponse.json(searches);
  } catch (err) {
    console.error("Failed to fetch saved searches:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const user = await getDummyUser();

    const body = await req.json();
    const validated = searchSchema.parse(body);
    
    const search = await SavedSearch.create({
      ...validated,
      userId: user._id,
    });
    return NextResponse.json(search, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Validation failed", details: err.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
