import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

const MEETING_PREP_PROMPT = `You are a personal assistant preparing briefings for construction project meetings in Mallorca.

Generate a concise meeting preparation brief that includes:
1. Meeting context and purpose
2. Key discussion points based on open tasks
3. Outstanding payments or financial items to address
4. Recent decisions from past meetings
5. Suggested talking points and questions

Keep it actionable and focused. Use bullet points for clarity.
Format the output in clear sections with markdown headers.`;

async function getAnthropicClient() {
  const settings = await db.systemSettings.findUnique({
    where: { id: "default" },
  });
  
  const apiKey = settings?.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error("No API key configured");
  }
  
  return createAnthropic({ apiKey });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { meetingId } = body;

    // Get upcoming meetings (next 7 days)
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    let meetingsToPrep;

    if (meetingId) {
      // Prep specific meeting
      const meeting = await db.meeting.findUnique({
        where: { id: meetingId },
        include: {
          project: {
            include: {
              client: true,
              tasks: {
                where: { status: { notIn: ["COMPLETE", "CANCELLED"] } },
                orderBy: { priority: "asc" },
              },
              meetings: {
                where: { date: { lt: now } },
                orderBy: { date: "desc" },
                take: 3,
              },
              financialEntries: {
                orderBy: { date: "desc" },
                take: 10,
              },
            },
          },
        },
      });
      meetingsToPrep = meeting ? [meeting] : [];
    } else {
      // Prep all upcoming meetings
      meetingsToPrep = await db.meeting.findMany({
        where: {
          date: { gte: now, lte: weekFromNow },
        },
        include: {
          project: {
            include: {
              client: true,
              tasks: {
                where: { status: { notIn: ["COMPLETE", "CANCELLED"] } },
                orderBy: { priority: "asc" },
              },
              meetings: {
                where: { date: { lt: now } },
                orderBy: { date: "desc" },
                take: 3,
              },
              financialEntries: {
                orderBy: { date: "desc" },
                take: 10,
              },
            },
          },
        },
        orderBy: { date: "asc" },
      });
    }

    if (meetingsToPrep.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No upcoming meetings to prepare",
        meetingsPrepped: 0,
      });
    }

    const preppedMeetings: string[] = [];
    const errors: string[] = [];

    const anthropic = await getAnthropicClient();

    for (const meeting of meetingsToPrep) {
      try {
        // Build context
        const project = meeting.project;
        const openTasks = project.tasks;
        const recentMeetings = project.meetings;
        const financials = project.financialEntries;

        // Calculate financial summary
        const invoiced = financials
          .filter(f => f.type === "INVOICE_SENT")
          .reduce((sum, f) => sum + f.amount, 0);
        const paid = financials
          .filter(f => f.type === "INVOICE_PAID")
          .reduce((sum, f) => sum + f.amount, 0);
        const outstanding = invoiced - paid;

        const context = `
Meeting: ${meeting.title}
Date: ${meeting.date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
Type: ${meeting.type}

Project: ${project.name}
Client: ${project.client?.name || "Unknown"} (${project.client?.email || "No email"})
Location: ${project.location || "Not specified"}
Status: ${project.status}

Open Tasks (${openTasks.length}):
${openTasks.slice(0, 10).map(t => `- [${t.priority}] ${t.title}${t.dueDate ? ` (Due: ${t.dueDate.toLocaleDateString()})` : ""}`).join("\n")}

Financial Status:
- Budget: €${project.budget || 0}
- Invoiced: €${invoiced}
- Paid: €${paid}
- Outstanding: €${outstanding}

Recent Meeting Decisions:
${recentMeetings.map(m => {
  const decisions = m.decisions ? JSON.parse(m.decisions) : [];
  return `${m.title} (${m.date.toLocaleDateString()}): ${decisions.join(", ") || "No decisions recorded"}`;
}).join("\n") || "No previous meetings"}
        `.trim();

        const result = await generateText({
          model: anthropic("claude-sonnet-4-20250514"),
          system: MEETING_PREP_PROMPT,
          prompt: context,
        });
        const text = result.text;

        // Store the prep in the meeting notes if empty, or as metadata
        await db.meeting.update({
          where: { id: meeting.id },
          data: {
            rawNotes: meeting.rawNotes 
              ? meeting.rawNotes 
              : `## Meeting Preparation\n\n${text}`,
          },
        });

        // Log activity
        await db.activityLog.create({
          data: {
            entityType: "MEETING",
            entityId: meeting.id,
            action: "UPDATED",
            description: `AI prepared briefing for meeting: ${meeting.title}`,
            metadata: JSON.stringify({ auto: true, prepLength: text.length }),
          },
        });

        preppedMeetings.push(meeting.id);
      } catch (error) {
        errors.push(`Failed to prep meeting ${meeting.id}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Prepared ${preppedMeetings.length} meeting briefings`,
      meetingsPrepped: preppedMeetings.length,
      meetingIds: preppedMeetings,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Meeting prep agent error:", error);
    
    if (error instanceof Error && error.message.includes("No API key")) {
      return NextResponse.json(
        { error: "Please configure your API key in Settings" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to run meeting prep agent" },
      { status: 500 }
    );
  }
}

// GET endpoint to see upcoming meetings
export async function GET() {
  try {
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const upcomingMeetings = await db.meeting.findMany({
      where: {
        date: { gte: now, lte: weekFromNow },
      },
      include: {
        project: {
          include: {
            client: true,
            _count: {
              select: {
                tasks: { where: { status: { notIn: ["COMPLETE", "CANCELLED"] } } },
              },
            },
          },
        },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({
      meetings: upcomingMeetings.map(m => ({
        id: m.id,
        title: m.title,
        date: m.date,
        type: m.type,
        projectName: m.project.name,
        clientName: m.project.client?.name || "Unknown",
        openTasks: m.project._count.tasks,
        hasNotes: !!m.rawNotes,
      })),
      count: upcomingMeetings.length,
    });
  } catch (error) {
    console.error("Error fetching upcoming meetings:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}
