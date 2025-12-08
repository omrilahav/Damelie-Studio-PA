// Advisor alerts helper - Server-side utilities

import { formatCurrency } from "./utils";

export interface AdvisorAlert {
  id: string;
  type: "workload" | "margin" | "stalled" | "overdue_payment";
  severity: "warning" | "critical";
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  metadata?: Record<string, unknown>;
}

// Helper function to generate alerts from data
export function generateAdvisorAlerts(data: {
  settings: {
    weeklyCapacityHours: number;
    marginWarningThreshold: number;
  };
  projects: Array<{
    id: string;
    name: string;
    status: string;
    estimatedHours: number | null;
    actualHours: number;
    updatedAt: Date;
    budget: number | null;
    costs: number;
    margin: number;
  }>;
  overduePayments: Array<{
    id: string;
    projectName: string;
    amount: number;
    daysOverdue: number;
  }>;
}): AdvisorAlert[] {
  const alerts: AdvisorAlert[] = [];

  // 1. Workload Capacity Warning
  const totalEstimatedHours = data.projects
    .filter(p => p.status === "ACTIVE")
    .reduce((sum, p) => sum + (p.estimatedHours || 0) - p.actualHours, 0);
  
  const weeklyCapacity = data.settings.weeklyCapacityHours;
  const weeksToComplete = totalEstimatedHours / weeklyCapacity;

  if (weeksToComplete > 8) {
    alerts.push({
      id: "workload-critical",
      type: "workload",
      severity: "critical",
      title: "Workload Overload",
      description: `You have ${totalEstimatedHours.toFixed(0)} hours of work remaining across active projects. At your current capacity (${weeklyCapacity}h/week), this would take ${weeksToComplete.toFixed(1)} weeks.`,
      action: {
        label: "Review Projects",
        href: "/projects?status=ACTIVE",
      },
    });
  } else if (weeksToComplete > 4) {
    alerts.push({
      id: "workload-warning",
      type: "workload",
      severity: "warning",
      title: "High Workload",
      description: `${totalEstimatedHours.toFixed(0)} hours of work remaining. Consider prioritizing or delegating tasks.`,
      action: {
        label: "View Tasks",
        href: "/tasks",
      },
    });
  }

  // 2. Margin Risk Alerts
  const atRiskProjects = data.projects.filter(
    p => p.status === "ACTIVE" && p.margin < data.settings.marginWarningThreshold && p.budget
  );

  atRiskProjects.forEach(project => {
    alerts.push({
      id: `margin-${project.id}`,
      type: "margin",
      severity: project.margin < 5 ? "critical" : "warning",
      title: `Low Margin: ${project.name}`,
      description: `Project margin is ${project.margin.toFixed(1)}% (threshold: ${data.settings.marginWarningThreshold}%). Review costs and consider adjustments.`,
      action: {
        label: "View Project",
        href: `/projects/${project.id}`,
      },
      metadata: { margin: project.margin },
    });
  });

  // 3. Stalled Project Detection
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const stalledProjects = data.projects.filter(
    p => p.status === "ACTIVE" && new Date(p.updatedAt) < thirtyDaysAgo
  );

  stalledProjects.forEach(project => {
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(project.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    alerts.push({
      id: `stalled-${project.id}`,
      type: "stalled",
      severity: daysSinceUpdate > 60 ? "critical" : "warning",
      title: `Stalled Project: ${project.name}`,
      description: `No activity in ${daysSinceUpdate} days. Consider following up or updating status.`,
      action: {
        label: "View Project",
        href: `/projects/${project.id}`,
      },
      metadata: { daysSinceUpdate },
    });
  });

  // 4. Overdue Payment Alerts
  data.overduePayments.forEach(payment => {
    alerts.push({
      id: `payment-${payment.id}`,
      type: "overdue_payment",
      severity: payment.daysOverdue > 30 ? "critical" : "warning",
      title: `Overdue Payment: ${payment.projectName}`,
      description: `${formatCurrency(payment.amount)} outstanding for ${payment.daysOverdue} days.`,
      action: {
        label: "View Finance",
        href: "/finance",
      },
      metadata: { amount: payment.amount, daysOverdue: payment.daysOverdue },
    });
  });

  // Sort by severity (critical first)
  return alerts.sort((a, b) => {
    if (a.severity === "critical" && b.severity !== "critical") return -1;
    if (a.severity !== "critical" && b.severity === "critical") return 1;
    return 0;
  });
}
