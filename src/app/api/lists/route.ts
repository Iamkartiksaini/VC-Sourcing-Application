import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SavedList from "@/models/SavedList";
import { z } from "zod";
import { getDummyUser } from "@/lib/auth";

const listSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  color: z.string().min(1),
});

export async function GET() {
  try {
    await dbConnect();
    const user = await getDummyUser();
    const lists = await SavedList.find({ userId: user._id }).sort({ createdAt: -1 });
    return NextResponse.json(lists);
  } catch (err) {
    console.error("Failed to fetch lists:", err);
    return NextResponse.json({ error: "Failed to fetch lists" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const user = await getDummyUser();

    const body = await req.json();
    const validated = listSchema.parse(body);
    
    const list = await SavedList.create({
      ...validated,
      userId: user._id,
      companyIds: [],
    });
    return NextResponse.json(list, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.errors }, { status: 400 });
    }
    console.error("Failed to create list:", err);
    return NextResponse.json({ error: "Failed to create list" }, { status: 500 });
  }
}
