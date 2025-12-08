import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateBriefing } from "@/lib/ai/client";
import { 
  DAILY_BRIEFING_SYSTEM_PROMPT, 
  WEEKLY_BRIEFING_SYSTEM_PROMPT 
} from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  try {
    const { type = "daily" } = await request.json();

    // Gather context data
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    const weekEnd = new Date(todayStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const [
      activeProjects,
      urgentTasks,
      overdueTasks,
      todayMeetings,
      weekMeetings,
      pendingReminders,
      recentActivity,
    ] = await Promise.all([
      db.project.findMany({
        where: { status: "ACTIVE" },
        include: { 
          client: true,
          _count: { 
            select: { 
              tasks: { where: { status: { notIn: ["COMPLETE", "CANCELLED"] } } } 
            } 
          },
        },
      }),
      db.task.findMany({
        where: {
          status: { notIn: ["COMPLETE", "CANCELLED"] },
          OR: [
            { priority: "URGENT_PAYMENT" },
            { priority: "BOQ_OFFER" },
          ],
        },
        include: { project: true },
      }),
      db.task.findMany({
        where: {
          status: { notIn: ["COMPLETE", "CANCELLED"] },
          dueDate: { lt: todayStart },
        },
        include: { project: true },
      }),
      db.meeting.findMany({
        where: { date: { gte: todayStart, lt: todayEnd } },
        include: { project: true },
        orderBy: { date: "asc" },
      }),
      db.meeting.findMany({
        where: { date: { gte: todayStart, lt: weekEnd } },
        include: { project: true },
        orderBy: { date: "asc" },
      }),
      db.reminder.count({ where: { status: "DRAFT" } }),
      db.activityLog.findMany({
        where: { 
          createdAt: { 
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) 
          } 
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    // Build context string
    const context = buildBriefingContext({
      type,
      activeProjects,
      urgentTasks,
      overdueTasks,
      todayMeetings,
      weekMeetings,
      pendingReminders,
      recentActivity,
    });

    const systemPrompt = type === "weekly" 
      ? WEEKLY_BRIEFING_SYSTEM_PROMPT 
      : DAILY_BRIEFING_SYSTEM_PROMPT;

    const briefing = await generateBriefing(systemPrompt, context);

    return NextResponse.json({ briefing });
  } catch (error) {
    console.error("Briefing generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate briefing" },
      { status: 500 }
    );
  }
}

function buildBriefingContext(data: {
  type: string;
  activeProjects: any[];
  urgentTasks: any[];
  overdueTasks: any[];
  todayMeetings: any[];
  weekMeetings: any[];
  pendingReminders: number;
  recentActivity: any[];
}): string {
  const lines: string[] = [];

  lines.push(`=== ${data.type.toUpperCase()} BRIEFING CONTEXT ===`);
  lines.push(`Date: ${new Date().toLocaleDateString("en-GB", { 
    weekday: "long", 
    day: "numeric", 
    month: "long", 
    year: "numeric" 
  })}`);
  lines.push("");

  // Active Projects
  lines.push(`## Active Projects (${data.activeProjects.length})`);
  if (data.activeProjects.length === 0) {
    lines.push("No active projects currently.");
  } else {
    data.activeProjects.forEach((p) => {
      lines.push(`- ${p.name} (Client: ${p.client?.name || "N/A"}) - ${p._count.tasks} open tasks`);
    });
  }
  lines.push("");

  // Urgent Tasks
  lines.push(`## Urgent Tasks (${data.urgentTasks.length})`);
  if (data.urgentTasks.length === 0) {
    lines.push("No urgent tasks.");
  } else {
    data.urgentTasks.forEach((t) => {
      lines.push(`- [${t.priority}] ${t.title} (Project: ${t.project?.name || "General"})`);
    });
  }
  lines.push("");

  // Overdue Tasks
  lines.push(`## Overdue Tasks (${data.overdueTasks.length})`);
  if (data.overdueTasks.length === 0) {
    lines.push("No overdue tasks. Great job staying on track!");
  } else {
    data.overdueTasks.forEach((t) => {
      const daysOverdue = Math.ceil(
        (new Date().getTime() - new Date(t.dueDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      lines.push(`- ${t.title} (${daysOverdue} days overdue) - Project: ${t.project?.name || "General"}`);
    });
  }
  lines.push("");

  // Today's Schedule
  lines.push(`## Today's Schedule (${data.todayMeetings.length} meetings)`);
  if (data.todayMeetings.length === 0) {
    lines.push("No meetings scheduled for today.");
  } else {
    data.todayMeetings.forEach((m) => {
      const time = new Date(m.date).toLocaleTimeString("en-GB", { 
        hour: "2-digit", 
        minute: "2-digit" 
      });
      lines.push(`- ${time}: ${m.title} (${m.type}) - ${m.project.name}`);
    });
  }
  lines.push("");

  // This Week
  if (data.type === "weekly" || data.weekMeetings.length > data.todayMeetings.length) {
    lines.push(`## This Week (${data.weekMeetings.length} total meetings)`);
    const upcomingMeetings = data.weekMeetings.filter(
      (m) => new Date(m.date) > new Date()
    );
    upcomingMeetings.slice(0, 5).forEach((m) => {
      const dateTime = new Date(m.date).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      lines.push(`- ${dateTime}: ${m.title} - ${m.project.name}`);
    });
    lines.push("");
  }

  // Pending Reminders
  lines.push(`## Pending Reminders: ${data.pendingReminders} draft reminders awaiting approval`);
  lines.push("");

  // Recent Activity
  if (data.recentActivity.length > 0) {
    lines.push("## Yesterday's Activity");
    data.recentActivity.slice(0, 5).forEach((a) => {
      lines.push(`- ${a.description}`);
    });
  }

  return lines.join("\n");
}

