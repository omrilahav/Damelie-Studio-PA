import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    let settings = await db.systemSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await db.systemSettings.create({
        data: { id: "default" },
      });
    }

    // Return settings with flags indicating if API keys are set (not the actual keys)
    return NextResponse.json({
      ...settings,
      anthropicApiKey: undefined,
      openaiApiKey: undefined,
      hasAnthropicKey: !!settings.anthropicApiKey,
      hasOpenaiKey: !!settings.openaiApiKey,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();

    // Build update object, only including fields that are present
    const updateData: Record<string, unknown> = {};

    if (data.userName !== undefined) updateData.userName = data.userName;
    if (data.defaultCurrency !== undefined) updateData.defaultCurrency = data.defaultCurrency;
    if (data.workingHoursPerDay !== undefined) updateData.workingHoursPerDay = data.workingHoursPerDay;
    if (data.weeklyCapacityHours !== undefined) updateData.weeklyCapacityHours = data.weeklyCapacityHours;
    if (data.marginWarningThreshold !== undefined) updateData.marginWarningThreshold = data.marginWarningThreshold;
    if (data.aiProvider !== undefined) updateData.aiProvider = data.aiProvider;
    
    // Handle API keys - can be set to a new value or explicitly set to null to remove
    if (data.anthropicApiKey !== undefined) {
      updateData.anthropicApiKey = data.anthropicApiKey || null;
    }
    if (data.openaiApiKey !== undefined) {
      updateData.openaiApiKey = data.openaiApiKey || null;
    }

    const settings = await db.systemSettings.upsert({
      where: { id: "default" },
      update: updateData,
      create: {
        id: "default",
        ...updateData,
      },
    });

    // Return settings without exposing the actual API keys
    return NextResponse.json({
      ...settings,
      anthropicApiKey: undefined,
      openaiApiKey: undefined,
      hasAnthropicKey: !!settings.anthropicApiKey,
      hasOpenaiKey: !!settings.openaiApiKey,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
