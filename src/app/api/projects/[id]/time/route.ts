import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { hours, description } = await request.json();

    if (!hours || hours <= 0) {
      return NextResponse.json(
        { error: "Invalid hours value" },
        { status: 400 }
      );
    }

    // Get current project hours
    const project = await db.project.findUnique({
      where: { id },
      select: { actualHours: true, name: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Update project hours
    const updatedProject = await db.project.update({
      where: { id },
      data: {
        actualHours: project.actualHours + hours,
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        entityType: "PROJECT",
        entityId: id,
        action: "UPDATED",
        description: `Logged ${hours}h on ${project.name}: ${description || "Time entry"}`,
        metadata: JSON.stringify({ hours, description, totalHours: updatedProject.actualHours }),
      },
    });

    return NextResponse.json({
      success: true,
      totalHours: updatedProject.actualHours,
    });
  } catch (error) {
    console.error("Error logging time:", error);
    return NextResponse.json(
      { error: "Failed to log time" },
      { status: 500 }
    );
  }
}
