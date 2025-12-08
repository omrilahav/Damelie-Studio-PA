import { Header } from "@/components/layout/header";
import { TasksList } from "@/components/tasks/tasks-list";
import { TaskFilters } from "@/components/tasks/task-filters";
import { db } from "@/lib/db";

interface TasksPageProps {
  searchParams: Promise<{ status?: string; priority?: string; project?: string }>;
}

async function getTasks(status?: string, priority?: string, projectId?: string) {
  const where: any = {};

  if (status && status !== "all") {
    where.status = status;
  }

  if (priority && priority !== "all") {
    where.priority = priority;
  }

  if (projectId && projectId !== "all") {
    where.projectId = projectId;
  }

  return db.task.findMany({
    where,
    include: {
      project: {
        include: { client: true },
      },
      _count: {
        select: { reminders: true },
      },
    },
    orderBy: [
      { status: "asc" },
      { priority: "asc" },
      { dueDate: "asc" },
    ],
  });
}

async function getTaskStats() {
  const [total, open, inProgress, complete, overdue] = await Promise.all([
    db.task.count({ where: { status: { not: "CANCELLED" } } }),
    db.task.count({ where: { status: "OPEN" } }),
    db.task.count({ where: { status: "IN_PROGRESS" } }),
    db.task.count({ where: { status: "COMPLETE" } }),
    db.task.count({ 
      where: { 
        status: { notIn: ["COMPLETE", "CANCELLED"] },
        dueDate: { lt: new Date() },
      } 
    }),
  ]);

  return { total, open, inProgress, complete, overdue };
}

async function getProjects() {
  return db.project.findMany({
    where: { status: { in: ["ACTIVE", "NEGOTIATION"] } },
    orderBy: { name: "asc" },
  });
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams;
  const [tasks, stats, projects] = await Promise.all([
    getTasks(params.status, params.priority, params.project),
    getTaskStats(),
    getProjects(),
  ]);

  return (
    <>
      <Header 
        title="Tasks" 
        subtitle={`${stats.total} tasks · ${stats.overdue} overdue`}
      />
      
      <div className="p-6 space-y-6">
        <TaskFilters stats={stats} projects={projects} />
        <TasksList tasks={tasks} />
      </div>
    </>
  );
}

