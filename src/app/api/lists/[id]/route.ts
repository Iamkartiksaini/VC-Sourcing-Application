import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SavedList from "@/models/SavedList";
import { z } from "zod";
import { getDummyUser } from "@/lib/auth";

const updateSchema = z.object({
  companyIds: z.array(z.string()).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const user = await getDummyUser();
    const { id } = await params;

    const body = await req.json();
    const validated = updateSchema.parse(body);

    const list = await SavedList.findOneAndUpdate(
      { _id: id, userId: user._id },
      validated,
      { new: true, runValidators: true }
    );

    if (!list) return NextResponse.json({ error: "List not found" }, { status: 404 });
    return NextResponse.json(list);
  } catch (err: any) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Validation failed", details: err.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to update list" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const user = await getDummyUser();
    const { id } = await params;

    const deleted = await SavedList.findOneAndDelete({ _id: id, userId: user._id });
    if (!deleted) return NextResponse.json({ error: "List not found" }, { status: 404 });
    
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete list" }, { status: 500 });
  }
}
