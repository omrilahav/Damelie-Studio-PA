import { Header } from "@/components/layout/header";
import { TaskForm } from "@/components/tasks/task-form";
import { db } from "@/lib/db";

async function getProjects() {
  return db.project.findMany({
    where: { status: { in: ["ACTIVE", "NEGOTIATION", "LEAD"] } },
    orderBy: { name: "asc" },
  });
}

export default async function NewTaskPage() {
  const projects = await getProjects();

  return (
    <>
      <Header 
        title="New Task" 
        subtitle="Create a new task"
      />
      
      <div className="p-6 max-w-2xl">
        <TaskForm projects={projects} />
      </div>
    </>
  );
}

