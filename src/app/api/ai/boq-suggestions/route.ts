import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

const BOQ_SUGGESTION_PROMPT = `You are an expert construction cost estimator in Mallorca, Spain. 
Given an item description and historical price data, provide price suggestions and similar items.

Your response must be a valid JSON object with this structure:
{
  "suggestedPrice": {
    "min": number,
    "max": number,
    "recommended": number,
    "confidence": "high" | "medium" | "low",
    "reasoning": "Brief explanation of the price suggestion"
  },
  "similarItems": [
    {
      "item": "Item name from history",
      "unitPrice": number,
      "unit": "unit type",
      "date": "when it was priced",
      "relevance": "high" | "medium" | "low"
    }
  ],
  "tips": ["Tip 1", "Tip 2"]
}

Important:
- Use EUR as currency
- Consider inflation (approx 3% per year)
- Prioritize recent prices over older ones
- Mark confidence as "low" if no similar items found
- Return empty similarItems array if none match`;

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
    const { item, category, unit } = await request.json();

    if (!item) {
      return NextResponse.json(
        { error: "Item description is required" },
        { status: 400 }
      );
    }

    // Get historical data from last 3 years
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    const historicalItems = await db.boQItem.findMany({
      where: {
        date: { gte: threeYearsAgo },
        ...(category ? { category } : {}),
      },
      include: {
        project: true,
      },
      orderBy: { date: "desc" },
      take: 50,
    });

    // Build context for AI
    const historyContext = historicalItems.map(h => ({
      item: h.item,
      category: h.category,
      unit: h.unit,
      unitPrice: h.unitPrice,
      date: h.date.toISOString().split("T")[0],
      project: h.project?.name || "General",
      source: h.source,
    }));

    const anthropic = await getAnthropicClient();

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: BOQ_SUGGESTION_PROMPT,
      prompt: `
Item to price: ${item}
Category: ${category || "Not specified"}
Unit: ${unit || "Not specified"}

Historical price data (last 3 years):
${JSON.stringify(historyContext, null, 2)}

Please provide price suggestions based on this data.
      `.trim(),
    });
    const text = result.text;

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[0]);
      return NextResponse.json(suggestions);
    }

    return NextResponse.json({
      suggestedPrice: null,
      similarItems: [],
      tips: ["Unable to generate suggestions. Try providing more details."],
    });
  } catch (error) {
    console.error("BoQ suggestion error:", error);
    
    if (error instanceof Error && error.message.includes("No API key")) {
      return NextResponse.json(
        { error: "Please configure your API key in Settings" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
