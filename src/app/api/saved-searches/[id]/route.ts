import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SavedSearch from "@/models/SavedSearch";
import { getDummyUser } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const user = await getDummyUser();
    const { id } = await params;

    const deleted = await SavedSearch.findOneAndDelete({ _id: id, userId: user._id });
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
