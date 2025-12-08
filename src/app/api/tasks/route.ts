import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const projectId = searchParams.get("project");

    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (priority && priority !== "all") {
      where.priority = priority;
    }

    if (projectId && projectId !== "all") {
      where.projectId = projectId;
    }

    const tasks = await db.task.findMany({
      where,
      include: {
        project: {
          include: { client: true },
        },
        _count: {
          select: { reminders: true },
        },
      },
      orderBy: [
        { status: "asc" },
        { priority: "asc" },
        { dueDate: "asc" },
      ],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const task = await db.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || "OPEN",
        priority: data.priority || "NORMAL",
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        projectId: data.projectId || null,
        meetingId: data.meetingId || null,
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        entityType: "TASK",
        entityId: task.id,
        action: "CREATED",
        description: `Created task: ${task.title}`,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

