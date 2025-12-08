import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const meetings = await db.meeting.findMany({
      include: {
        project: {
          include: { client: true },
        },
        _count: {
          select: { extractedTasks: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(meetings);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Create meeting
    const meeting = await db.meeting.create({
      data: {
        title: data.title,
        date: new Date(data.date),
        type: data.type || "MEETING",
        projectId: data.projectId,
        rawNotes: data.rawNotes,
        summary: data.summary,
        decisions: JSON.stringify(data.decisions || []),
        confirmed: false,
      },
    });

    // Create extracted tasks if any
    if (data.tasks && data.tasks.length > 0) {
      await db.task.createMany({
        data: data.tasks.map((task: any) => ({
          title: task.title,
          description: task.notes || null,
          priority: task.priority || "NORMAL",
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          projectId: data.projectId,
          meetingId: meeting.id,
          status: "OPEN",
        })),
      });
    }

    // Log activity
    await db.activityLog.create({
      data: {
        entityType: "MEETING",
        entityId: meeting.id,
        action: "CREATED",
        description: `Recorded meeting: ${meeting.title}`,
        metadata: JSON.stringify({
          tasksExtracted: data.tasks?.length || 0,
        }),
      },
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 }
    );
  }
}

