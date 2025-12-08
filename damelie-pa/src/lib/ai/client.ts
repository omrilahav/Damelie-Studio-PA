import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText, streamText } from "ai";
import { db } from "@/lib/db";

// Get the API key from database settings, falling back to environment variable
async function getAnthropicApiKey(): Promise<string> {
  const settings = await db.systemSettings.findUnique({
    where: { id: "default" },
  });
  
  return settings?.anthropicApiKey || process.env.ANTHROPIC_API_KEY || "";
}

// Create Anthropic client with the appropriate API key
async function createAnthropicClient() {
  const apiKey = await getAnthropicApiKey();
  
  if (!apiKey) {
    throw new Error("No API key configured. Please add your Anthropic API key in Settings.");
  }
  
  return createAnthropic({ apiKey });
}

export async function generateBriefing(
  systemPrompt: string,
  context: string
): Promise<string> {
  try {
    const anthropic = await createAnthropicClient();
    
    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: systemPrompt,
      prompt: context,
    });
    return result.text;
  } catch (error) {
    console.error("AI generation error:", error);
    if (error instanceof Error && error.message.includes("No API key")) {
      throw error;
    }
    throw new Error("Failed to generate briefing. Please check your API key in Settings.");
  }
}

export async function processMeetingNotes(
  rawNotes: string,
  projectName: string
): Promise<{
  summary: string;
  decisions: string[];
  tasks: Array<{
    title: string;
    priority: string;
    dueDate: string | null;
    notes: string;
  }>;
  followUps: string[];
}> {
  const { MEETING_SUMMARY_SYSTEM_PROMPT } = await import("./prompts");

  try {
    const anthropic = await createAnthropicClient();
    
    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: MEETING_SUMMARY_SYSTEM_PROMPT,
      prompt: `Project: ${projectName}\n\nMeeting Notes:\n${rawNotes}`,
    });
    const text = result.text;

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback if no JSON found
    return {
      summary: text,
      decisions: [],
      tasks: [],
      followUps: [],
    };
  } catch (error) {
    console.error("Meeting processing error:", error);
    if (error instanceof Error && error.message.includes("No API key")) {
      throw error;
    }
    throw new Error("Failed to process meeting notes. Please check your API key in Settings.");
  }
}

export async function draftReminder(
  taskTitle: string,
  taskDescription: string,
  projectName: string,
  clientName: string,
  daysPastDue?: number
): Promise<string> {
  const { REMINDER_DRAFT_SYSTEM_PROMPT } = await import("./prompts");

  try {
    const anthropic = await createAnthropicClient();
    
    const context = `
Task: ${taskTitle}
${taskDescription ? `Details: ${taskDescription}` : ""}
Project: ${projectName}
Client: ${clientName}
${daysPastDue ? `Days overdue: ${daysPastDue}` : ""}

Please draft a reminder message for this task.
    `.trim();

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: REMINDER_DRAFT_SYSTEM_PROMPT,
      prompt: context,
    });

    return result.text;
  } catch (error) {
    console.error("Reminder draft error:", error);
    if (error instanceof Error && error.message.includes("No API key")) {
      throw error;
    }
    throw new Error("Failed to draft reminder. Please check your API key in Settings.");
  }
}

export async function createStreamingBriefing(systemPrompt: string, context: string) {
  const anthropic = await createAnthropicClient();
  
  return streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: systemPrompt,
    prompt: context,
  });
}
