import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const project = await db.project.findUnique({
      where: { id },
      include: {
        client: true,
        tasks: {
          orderBy: [{ status: "asc" }, { priority: "asc" }, { dueDate: "asc" }],
        },
        meetings: {
          orderBy: { date: "desc" },
          take: 10,
        },
        financialEntries: {
          orderBy: { date: "desc" },
        },
        boqItems: {
          orderBy: { category: "asc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const project = await db.project.update({
      where: { id },
      data: {
        name: data.name,
        status: data.status,
        clientId: data.clientId || null,
        description: data.description,
        location: data.location,
        budget: data.budget,
        estimatedHours: data.estimatedHours,
        actualHours: data.actualHours,
        driveFolder: data.driveFolder,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        priority: data.priority,
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        entityType: "PROJECT",
        entityId: project.id,
        action: "UPDATED",
        description: `Updated project: ${project.name}`,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await db.project.delete({
      where: { id },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        entityType: "PROJECT",
        entityId: id,
        action: "DELETED",
        description: `Deleted project: ${project.name}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}

