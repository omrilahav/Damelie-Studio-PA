import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create system settings
  await prisma.systemSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      userName: "Damelie Studio",
      defaultCurrency: "EUR",
      workingHoursPerDay: 8,
      weeklyCapacityHours: 40,
      marginWarningThreshold: 15,
    },
  });

  // Create sample clients
  const client1 = await prisma.client.create({
    data: {
      name: "Maria Schmidt",
      company: "Schmidt Investments",
      email: "maria@schmidtinvest.com",
      phone: "+34 600 123 456",
      address: "Son Vida, Mallorca",
      notes: "Referred by previous client. Interested in high-end finishes.",
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: "Thomas Weber",
      company: "Weber Family Office",
      email: "thomas.weber@wfo.de",
      phone: "+49 170 987 654",
      address: "Munich / Pollença, Mallorca",
      notes: "German client, prefers communication in English. Very detail-oriented.",
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: "Elena Martinez",
      email: "elena.m@outlook.com",
      phone: "+34 622 555 789",
      address: "Palma de Mallorca",
    },
  });

  // Create sample projects
  const project1 = await prisma.project.create({
    data: {
      name: "Villa Renovation Son Vida",
      status: "ACTIVE",
      clientId: client1.id,
      description: "Complete renovation of 450m² villa including new kitchen, bathrooms, and pool area.",
      location: "Son Vida, Mallorca",
      budget: 380000,
      estimatedHours: 450,
      actualHours: 120,
      driveFolder: "https://drive.google.com/drive/folders/example1",
      startDate: new Date("2024-09-15"),
      endDate: new Date("2025-06-30"),
      priority: 1,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Finca Modernization Pollença",
      status: "ACTIVE",
      clientId: client2.id,
      description: "Modernization of traditional finca. Focus on preserving character while updating systems.",
      location: "Pollença, Mallorca",
      budget: 520000,
      estimatedHours: 600,
      actualHours: 85,
      startDate: new Date("2024-11-01"),
      priority: 2,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: "Apartment Refresh Palma",
      status: "NEGOTIATION",
      clientId: client3.id,
      description: "Light renovation of 120m² apartment in Palma old town.",
      location: "Palma de Mallorca",
      budget: 85000,
      estimatedHours: 150,
      priority: 4,
    },
  });

  const project4 = await prisma.project.create({
    data: {
      name: "New Build - Porto Cristo",
      status: "LEAD",
      description: "Potential new build project near Porto Cristo. Initial consultation scheduled.",
      location: "Porto Cristo, Mallorca",
      budget: 650000,
      priority: 5,
    },
  });

  // Create sample tasks
  await prisma.task.createMany({
    data: [
      {
        title: "Send updated invoice for kitchen phase",
        description: "Invoice for €45,000 - kitchen cabinets and appliances delivered",
        status: "OPEN",
        priority: "URGENT_PAYMENT",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        projectId: project1.id,
      },
      {
        title: "Prepare BoQ for bathroom renovation",
        description: "Client requested detailed breakdown for master and guest bathrooms",
        status: "IN_PROGRESS",
        priority: "BOQ_OFFER",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        projectId: project1.id,
      },
      {
        title: "Follow up on tile delivery",
        description: "Tiles of Ezra order - check delivery status",
        status: "AWAITING_CLIENT",
        priority: "NORMAL",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        projectId: project1.id,
      },
      {
        title: "Get quotes from electricians",
        description: "Need 3 quotes for full electrical rewiring",
        status: "OPEN",
        priority: "BOQ_OFFER",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        projectId: project2.id,
      },
      {
        title: "Site visit - roof inspection",
        description: "Schedule with structural engineer",
        status: "PENDING",
        priority: "NORMAL",
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        projectId: project2.id,
      },
      {
        title: "Send proposal to Elena",
        description: "Complete project proposal with timeline and budget",
        status: "OPEN",
        priority: "OPPORTUNITY",
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        projectId: project3.id,
      },
      {
        title: "Review architect drawings",
        status: "COMPLETE",
        priority: "NORMAL",
        projectId: project1.id,
      },
      {
        title: "Order kitchen appliances",
        status: "COMPLETE",
        priority: "NORMAL",
        projectId: project1.id,
      },
    ],
  });

  // Create sample meetings
  const meeting1 = await prisma.meeting.create({
    data: {
      title: "Kitchen Design Review",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      type: "MEETING",
      projectId: project1.id,
      rawNotes: "Met with Maria to review final kitchen design. She approved the marble countertop selection. Discussed timeline for appliance delivery. Need to coordinate with electrician for outlet placement.",
      summary: "Kitchen design approved. Maria selected the Calacatta marble for countertops. Timeline confirmed for mid-January delivery of appliances.",
      decisions: JSON.stringify([
        "Calacatta marble approved for countertops",
        "Miele appliances confirmed",
        "Kitchen completion target: February 15",
      ]),
      confirmed: true,
    },
  });

  await prisma.meeting.create({
    data: {
      title: "Site Visit - Progress Check",
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      type: "SITE_VISIT",
      projectId: project1.id,
    },
  });

  await prisma.meeting.create({
    data: {
      title: "Initial Consultation",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      type: "CALL",
      projectId: project3.id,
    },
  });

  // Create sample financial entries
  await prisma.financialEntry.createMany({
    data: [
      {
        projectId: project1.id,
        type: "BUDGET",
        amount: 380000,
        description: "Total project budget",
        date: new Date("2024-09-15"),
      },
      {
        projectId: project1.id,
        type: "INVOICE_SENT",
        amount: 76000,
        description: "20% initial deposit",
        date: new Date("2024-09-20"),
        invoiceRef: "INV-2024-001",
      },
      {
        projectId: project1.id,
        type: "INVOICE_PAID",
        amount: 76000,
        description: "Initial deposit received",
        date: new Date("2024-09-28"),
      },
      {
        projectId: project1.id,
        type: "INVOICE_SENT",
        amount: 45000,
        description: "Kitchen phase milestone",
        date: new Date("2024-12-01"),
        invoiceRef: "INV-2024-015",
      },
      {
        projectId: project1.id,
        type: "COST",
        amount: 28500,
        description: "Kitchen cabinets - Supplier payment",
        date: new Date("2024-11-15"),
      },
      {
        projectId: project1.id,
        type: "COST",
        amount: 12000,
        description: "Miele appliances",
        date: new Date("2024-11-20"),
      },
      {
        projectId: project2.id,
        type: "BUDGET",
        amount: 520000,
        description: "Total project budget",
        date: new Date("2024-11-01"),
      },
      {
        projectId: project2.id,
        type: "INVOICE_SENT",
        amount: 104000,
        description: "20% initial deposit",
        date: new Date("2024-11-05"),
        invoiceRef: "INV-2024-018",
      },
    ],
  });

  // Create sample BoQ items
  await prisma.boQItem.createMany({
    data: [
      {
        category: "Tiles",
        item: "Calacatta marble tiles 60x60cm",
        unit: "m²",
        unitPrice: 185,
        source: "Tiles of Ezra - Quote #4521",
        projectId: project1.id,
        date: new Date("2024-10-15"),
      },
      {
        category: "Tiles",
        item: "Terracotta floor tiles handmade",
        unit: "m²",
        unitPrice: 95,
        source: "Local supplier Mallorca",
        projectId: project2.id,
        date: new Date("2024-11-20"),
      },
      {
        category: "Kitchen",
        item: "Custom oak cabinets",
        unit: "m",
        unitPrice: 850,
        source: "Carpintería González",
        projectId: project1.id,
        date: new Date("2024-09-25"),
      },
      {
        category: "Kitchen",
        item: "Quartz countertop installation",
        unit: "m²",
        unitPrice: 320,
        source: "Stone Works Mallorca",
        date: new Date("2024-06-10"),
      },
      {
        category: "Bathroom",
        item: "Hansgrohe rain shower system",
        unit: "unit",
        unitPrice: 1250,
        source: "Official distributor",
        date: new Date("2024-08-15"),
      },
      {
        category: "Electrical",
        item: "Full rewiring (per m²)",
        unit: "m²",
        unitPrice: 45,
        source: "Average of 3 quotes",
        date: new Date("2024-07-20"),
      },
      {
        category: "Painting",
        item: "Interior painting premium finish",
        unit: "m²",
        unitPrice: 18,
        source: "Pinturas Palma",
        date: new Date("2024-05-10"),
      },
      {
        category: "Windows & Doors",
        item: "Aluminum window double glazed",
        unit: "m²",
        unitPrice: 380,
        source: "Technal certified",
        date: new Date("2024-04-22"),
      },
    ],
  });

  // Create sample reminders
  await prisma.reminder.createMany({
    data: [
      {
        taskId: (await prisma.task.findFirst({ where: { title: { contains: "invoice" } } }))!.id,
        message: "Hi Maria,\n\nI hope this message finds you well. I wanted to follow up on the kitchen phase invoice (€45,000) that was sent last week.\n\nPlease let me know if you have any questions about the details. I'm happy to clarify anything.\n\nBest regards,\nDamelie Studio",
        status: "DRAFT",
        recipient: "maria@schmidtinvest.com",
      },
      {
        taskId: (await prisma.task.findFirst({ where: { title: { contains: "tile delivery" } } }))!.id,
        message: "Hi Maria,\n\nJust checking in about the tile selection for the bathrooms. Have you had a chance to review the samples from Tiles of Ezra?\n\nWe'll need to confirm the order soon to stay on schedule.\n\nBest,\nDamelie Studio",
        status: "DRAFT",
        recipient: "maria@schmidtinvest.com",
      },
    ],
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

