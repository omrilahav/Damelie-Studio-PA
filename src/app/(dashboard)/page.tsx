import { Header } from "@/components/layout/header";
import { DailyBriefing } from "@/components/dashboard/daily-briefing";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { TodaySchedule } from "@/components/dashboard/today-schedule";
import { UrgentTasks } from "@/components/dashboard/urgent-tasks";
import { PendingReminders } from "@/components/dashboard/pending-reminders";
import { ProjectsOverview } from "@/components/dashboard/projects-overview";
import { AdvisorAlerts } from "@/components/dashboard/advisor-alerts";
import { generateAdvisorAlerts } from "@/lib/advisor-alerts";
import { AgentRunner } from "@/components/dashboard/agent-runner";
import { db } from "@/lib/db";

async function getDashboardData() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  const weekEnd = new Date(todayStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [
    activeProjects,
    totalTasks,
    completedTasks,
    urgentTasks,
    todayMeetings,
    pendingReminders,
    recentProjects,
    overdueTasks,
    settings,
    projectsWithFinance,
  ] = await Promise.all([
    db.project.count({ where: { status: "ACTIVE" } }),
    db.task.count({ where: { status: { not: "CANCELLED" } } }),
    db.task.count({ where: { status: "COMPLETE" } }),
    db.task.findMany({
      where: {
        status: { notIn: ["COMPLETE", "CANCELLED"] },
        OR: [
          { priority: "URGENT_PAYMENT" },
          { dueDate: { lte: todayEnd } },
        ],
      },
      include: { project: true },
      orderBy: [
        { priority: "asc" },
        { dueDate: "asc" },
      ],
      take: 5,
    }),
    db.meeting.findMany({
      where: {
        date: { gte: todayStart, lt: todayEnd },
      },
      include: { project: true },
      orderBy: { date: "asc" },
    }),
    db.reminder.findMany({
      where: { status: "DRAFT" },
      include: { task: { include: { project: true } } },
      take: 5,
    }),
    db.project.findMany({
      where: { status: { in: ["ACTIVE", "NEGOTIATION"] } },
      include: {
        client: true,
        _count: { select: { tasks: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    db.task.count({
      where: {
        status: { notIn: ["COMPLETE", "CANCELLED"] },
        dueDate: { lt: todayStart },
      },
    }),
    db.systemSettings.findUnique({ where: { id: "default" } }),
    db.project.findMany({
      where: { status: { in: ["ACTIVE", "NEGOTIATION"] } },
      include: {
        financialEntries: true,
      },
    }),
  ]);

  // Calculate project financials for alerts
  const projectsForAlerts = projectsWithFinance.map(project => {
    const budget = project.budget || 0;
    const costs = project.financialEntries
      .filter(e => e.type === "COST")
      .reduce((sum, e) => sum + e.amount, 0);
    const margin = budget > 0 ? ((budget - costs) / budget) * 100 : 0;

    return {
      id: project.id,
      name: project.name,
      status: project.status,
      estimatedHours: project.estimatedHours,
      actualHours: project.actualHours,
      updatedAt: project.updatedAt,
      budget,
      costs,
      margin,
    };
  });

  // Calculate overdue payments
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const overduePayments = projectsWithFinance.flatMap(project => {
    const invoiced = project.financialEntries
      .filter(e => e.type === "INVOICE_SENT" && new Date(e.date) < thirtyDaysAgo)
      .reduce((sum, e) => sum + e.amount, 0);
    const paid = project.financialEntries
      .filter(e => e.type === "INVOICE_PAID")
      .reduce((sum, e) => sum + e.amount, 0);
    const outstanding = invoiced - paid;

    if (outstanding > 0) {
      const oldestInvoice = project.financialEntries
        .filter(e => e.type === "INVOICE_SENT")
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
      
      if (oldestInvoice) {
        const daysOverdue = Math.floor(
          (Date.now() - new Date(oldestInvoice.date).getTime()) / (1000 * 60 * 60 * 24)
        );
        return [{
          id: project.id,
          projectName: project.name,
          amount: outstanding,
          daysOverdue,
        }];
      }
    }
    return [];
  }).filter(p => p.daysOverdue > 30);

  // Generate advisor alerts
  const advisorAlerts = generateAdvisorAlerts({
    settings: {
      weeklyCapacityHours: settings?.weeklyCapacityHours || 40,
      marginWarningThreshold: settings?.marginWarningThreshold || 15,
    },
    projects: projectsForAlerts,
    overduePayments,
  });

  return {
    stats: {
      activeProjects,
      totalTasks,
      completedTasks,
      overdueCount: overdueTasks,
    },
    urgentTasks,
    todayMeetings,
    pendingReminders,
    recentProjects,
    advisorAlerts,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <>
      <Header 
        title="Good morning" 
        subtitle="Here's your daily briefing" 
      />
      
      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <QuickStats stats={data.stats} />

        {/* Advisor Alerts - Show if there are any */}
        {data.advisorAlerts.length > 0 && (
          <AdvisorAlerts alerts={data.advisorAlerts} compact />
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Briefing & Tasks */}
          <div className="lg:col-span-2 space-y-6">
            <DailyBriefing />
            <UrgentTasks tasks={data.urgentTasks} />
          </div>

          {/* Right Column - Schedule & Reminders */}
          <div className="space-y-6">
            <TodaySchedule meetings={data.todayMeetings} />
            <PendingReminders reminders={data.pendingReminders} />
            <AgentRunner />
          </div>
        </div>

        {/* Projects Overview */}
        <ProjectsOverview projects={data.recentProjects} />
      </div>
    </>
  );
}

