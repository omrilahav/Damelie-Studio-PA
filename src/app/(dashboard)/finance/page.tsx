import { Header } from "@/components/layout/header";
import { FinanceOverview } from "@/components/finance/finance-overview";
import { ProjectFinanceList } from "@/components/finance/project-finance-list";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

async function getFinanceData() {
  const projects = await db.project.findMany({
    where: { status: { in: ["ACTIVE", "NEGOTIATION"] } },
    include: {
      client: true,
      financialEntries: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  // Calculate totals
  let totalBudget = 0;
  let totalInvoiced = 0;
  let totalPaid = 0;
  let totalCosts = 0;

  const projectsWithFinance = projects.map((project) => {
    const budget = project.financialEntries
      .filter((e) => e.type === "BUDGET")
      .reduce((sum, e) => sum + e.amount, 0) || project.budget || 0;
    
    const invoiced = project.financialEntries
      .filter((e) => e.type === "INVOICE_SENT")
      .reduce((sum, e) => sum + e.amount, 0);
    
    const paid = project.financialEntries
      .filter((e) => e.type === "INVOICE_PAID")
      .reduce((sum, e) => sum + e.amount, 0);
    
    const costs = project.financialEntries
      .filter((e) => e.type === "COST")
      .reduce((sum, e) => sum + e.amount, 0);

    const margin = budget > 0 ? ((budget - costs) / budget) * 100 : 0;
    const atRisk = margin < 15;

    totalBudget += budget;
    totalInvoiced += invoiced;
    totalPaid += paid;
    totalCosts += costs;

    return {
      ...project,
      finance: {
        budget,
        invoiced,
        paid,
        costs,
        margin,
        atRisk,
        outstanding: invoiced - paid,
      },
    };
  });

  return {
    projects: projectsWithFinance,
    totals: {
      budget: totalBudget,
      invoiced: totalInvoiced,
      paid: totalPaid,
      costs: totalCosts,
      outstanding: totalInvoiced - totalPaid,
      margin: totalBudget > 0 ? ((totalBudget - totalCosts) / totalBudget) * 100 : 0,
    },
  };
}

export default async function FinancePage() {
  const { projects, totals } = await getFinanceData();

  return (
    <>
      <Header 
        title="Finance" 
        subtitle={`Portfolio value: ${formatCurrency(totals.budget)}`}
      />
      
      <div className="p-6 space-y-6">
        <FinanceOverview totals={totals} />
        <ProjectFinanceList projects={projects} />
      </div>
    </>
  );
}

