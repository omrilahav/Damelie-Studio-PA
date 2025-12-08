import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { draftReminder } from "@/lib/ai/client";

// This agent automatically generates reminder drafts for overdue tasks
// that don't already have a pending reminder
export async function POST(request: NextRequest) {
  try {
    // Find overdue tasks without pending reminders
    const overdueTasks = await db.task.findMany({
      where: {
        status: { notIn: ["COMPLETE", "CANCELLED"] },
        dueDate: { lt: new Date() },
        // Exclude tasks that already have a draft or approved reminder
        NOT: {
          reminders: {
            some: {
              status: { in: ["DRAFT", "APPROVED"] },
            },
          },
        },
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
        reminders: true,
      },
    });

    if (overdueTasks.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No overdue tasks without reminders found",
        remindersCreated: 0,
      });
    }

    const createdReminders: string[] = [];
    const errors: string[] = [];

    for (const task of overdueTasks) {
      try {
        const daysPastDue = Math.ceil(
          (new Date().getTime() - new Date(task.dueDate!).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Generate AI reminder draft
        const reminderMessage = await draftReminder(
          task.title,
          task.description || "",
          task.project?.name || "General",
          task.project?.client?.name || "Client",
          daysPastDue
        );

        // Create the reminder in database
        const reminder = await db.reminder.create({
          data: {
            taskId: task.id,
            message: reminderMessage,
            status: "DRAFT",
            recipient: task.project?.client?.email || null,
          },
        });

        // Log activity
        await db.activityLog.create({
          data: {
            entityType: "REMINDER",
            entityId: reminder.id,
            action: "CREATED",
            description: `Auto-generated reminder for overdue task: ${task.title} (${daysPastDue} days overdue)`,
            metadata: JSON.stringify({ taskId: task.id, daysPastDue, auto: true }),
          },
        });

        createdReminders.push(reminder.id);
      } catch (error) {
        errors.push(`Failed to create reminder for task ${task.id}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdReminders.length} reminder drafts`,
      remindersCreated: createdReminders.length,
      reminderIds: createdReminders,
      tasksProcessed: overdueTasks.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Overdue reminder agent error:", error);
    return NextResponse.json(
      { error: "Failed to run overdue reminder agent" },
      { status: 500 }
    );
  }
}

// GET endpoint to check status and preview what would be generated
export async function GET() {
  try {
    const overdueTasks = await db.task.findMany({
      where: {
        status: { notIn: ["COMPLETE", "CANCELLED"] },
        dueDate: { lt: new Date() },
        NOT: {
          reminders: {
            some: {
              status: { in: ["DRAFT", "APPROVED"] },
            },
          },
        },
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    return NextResponse.json({
      overdueTasks: overdueTasks.map(task => ({
        id: task.id,
        title: task.title,
        dueDate: task.dueDate,
        daysPastDue: Math.ceil(
          (new Date().getTime() - new Date(task.dueDate!).getTime()) / (1000 * 60 * 60 * 24)
        ),
        projectName: task.project?.name || "General",
        clientName: task.project?.client?.name || "Unknown",
        clientEmail: task.project?.client?.email || null,
      })),
      count: overdueTasks.length,
    });
  } catch (error) {
    console.error("Error checking overdue tasks:", error);
    return NextResponse.json(
      { error: "Failed to check overdue tasks" },
      { status: 500 }
    );
  }
}
