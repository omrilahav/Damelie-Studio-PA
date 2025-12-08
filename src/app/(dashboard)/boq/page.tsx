import { Header } from "@/components/layout/header";
import { BoQHelper } from "@/components/boq/boq-helper";
import { BoQHistory } from "@/components/boq/boq-history";
import { db } from "@/lib/db";

async function getBoQItems() {
  // Get items from last 3 years as per spec
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

  return db.boQItem.findMany({
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
}

async function getProjects() {
  return db.project.findMany({
    where: { status: { in: ["ACTIVE", "NEGOTIATION", "LEAD"] } },
    orderBy: { name: "asc" },
  });
}

export default async function BoQPage() {
  const [boqItems, projects] = await Promise.all([
    getBoQItems(),
    getProjects(),
  ]);

  // Group by category
  const categories = [...new Set(boqItems.map(item => item.category))];

  return (
    <>
      <Header 
        title="BoQ Helper" 
        subtitle="Bill of Quantities management with price history"
      />
      
      <div className="p-6 space-y-6">
        <BoQHelper projects={projects} categories={categories} />
        <BoQHistory items={boqItems} />
      </div>
    </>
  );
}

