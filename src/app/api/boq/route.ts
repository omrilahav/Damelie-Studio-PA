import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Get items from last 3 years
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    const items = await db.boQItem.findMany({
      where: {
        date: { gte: threeYearsAgo },
      },
      include: {
        project: true,
      },
      orderBy: [
        { category: "asc" },
        { date: "desc" },
      ],
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching BoQ items:", error);
    return NextResponse.json(
      { error: "Failed to fetch BoQ items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const item = await db.boQItem.create({
      data: {
        category: data.category,
        item: data.item,
        unit: data.unit,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        source: data.source,
        notes: data.notes,
        projectId: data.projectId || null,
        date: new Date(),
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating BoQ item:", error);
    return NextResponse.json(
      { error: "Failed to create BoQ item" },
      { status: 500 }
    );
  }
}

