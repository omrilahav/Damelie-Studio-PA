import { NextRequest, NextResponse } from "next/server";
import { processMeetingNotes } from "@/lib/ai/client";

export async function POST(request: NextRequest) {
  try {
    const { rawNotes, projectName } = await request.json();

    if (!rawNotes || !projectName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await processMeetingNotes(rawNotes, projectName);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Meeting summary error:", error);
    return NextResponse.json(
      { error: "Failed to process meeting notes" },
      { status: 500 }
    );
  }
}

