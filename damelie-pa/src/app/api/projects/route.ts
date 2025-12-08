import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const projects = await db.project.findMany({
      where,
      include: {
        client: true,
        _count: {
          select: {
            tasks: true,
            meetings: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const project = await db.project.create({
      data: {
        name: data.name,
        status: data.status || "LEAD",
        clientId: data.clientId || null,
        description: data.description,
        location: data.location,
        budget: data.budget,
        estimatedHours: data.estimatedHours,
        driveFolder: data.driveFolder,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        entityType: "PROJECT",
        entityId: project.id,
        action: "CREATED",
        description: `Created project: ${project.name}`,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

