import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const clients = await db.client.findMany({
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const client = await db.client.create({
      data: {
        name: data.name,
        company: data.company,
        email: data.email,
        phone: data.phone,
        address: data.address,
        notes: data.notes,
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        entityType: "CLIENT",
        entityId: client.id,
        action: "CREATED",
        description: `Created client: ${client.name}`,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}

