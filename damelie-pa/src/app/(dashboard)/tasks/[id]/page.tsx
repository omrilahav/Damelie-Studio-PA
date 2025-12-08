import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Flag,
  FolderOpen,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

interface TaskPageProps {
  params: Promise<{ id: string }>;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  TODO: { label: "To Do", color: "bg-stone-100 text-stone-700", icon: Clock },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-700", icon: Clock },
  BLOCKED: { label: "Blocked", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  COMPLETE: { label: "Complete", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  LOW: { label: "Low", color: "text-stone-400" },
  MEDIUM: { label: "Medium", color: "text-amber-500" },
  HIGH: { label: "High", color: "text-orange-500" },
  URGENT: { label: "Urgent", color: "text-red-500" },
};

async function getTask(id: string) {
  return db.task.findUnique({
    where: { id },
    include: {
      project: {
        include: {
          client: true,
        },
      },
    },
  });
}

export default async function TaskPage({ params }: TaskPageProps) {
  const { id } = await params;
  const task = await getTask(id);

  if (!task) {
    notFound();
  }

  const status = statusConfig[task.status] || statusConfig.TODO;
  const priority = priorityConfig[task.priority] || priorityConfig.MEDIUM;
  const StatusIcon = status.icon;
  
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "COMPLETE";

  return (
    <>
      <Header 
        title={task.title} 
        subtitle={task.project?.name || "No project"}
      />
      
      <div className="p-6 space-y-6">
        {/* Back link and status */}
        <div className="flex items-center justify-between">
          <Link href="/tasks" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700">
            <ArrowLeft className="w-4 h-4" />
            Back to Tasks
          </Link>
          <div className="flex items-center gap-2">
            <span className={cn("px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5", status.color)}>
              <StatusIcon className="w-3.5 h-3.5" />
              {status.label}
            </span>
          </div>
        </div>

        {/* Task Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.description && (
                <div>
                  <p className="text-sm text-stone-500 mb-1">Description</p>
                  <p className="text-sm text-stone-700 whitespace-pre-wrap">{task.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Flag className={cn("w-4 h-4 mt-0.5", priority.color)} />
                  <div>
                    <p className="text-xs text-stone-500">Priority</p>
                    <p className={cn("text-sm font-medium", priority.color)}>{priority.label}</p>
                  </div>
                </div>
                
                {task.dueDate && (
                  <div className="flex items-start gap-2">
                    <Calendar className={cn("w-4 h-4 mt-0.5", isOverdue ? "text-red-500" : "text-stone-400")} />
                    <div>
                      <p className="text-xs text-stone-500">Due Date</p>
                      <p className={cn(
                        "text-sm font-medium",
                        isOverdue && "text-red-600"
                      )}>
                        {formatDate(task.dueDate)}
                        {isOverdue && " (Overdue)"}
                      </p>
                    </div>
                  </div>
                )}
                
              </div>
              
              <div className="pt-4 flex gap-2">
                <Link href={`/tasks/${task.id}/edit`}>
                  <Button variant="outline" size="sm">Edit Task</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Project Info */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-stone-400" />
                Project
              </CardTitle>
            </CardHeader>
            <CardContent>
              {task.project ? (
                <Link
                  href={`/projects/${task.project.id}`}
                  className="block p-3 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
                >
                  <p className="text-sm font-medium">{task.project.name}</p>
                  {task.project.client && (
                    <p className="text-xs text-stone-500 mt-1">{task.project.client.name}</p>
                  )}
                  {task.project.location && (
                    <p className="text-xs text-stone-400">{task.project.location}</p>
                  )}
                </Link>
              ) : (
                <p className="text-sm text-stone-500 text-center py-4">No project assigned</p>
              )}
              
              <div className="pt-4 text-xs text-stone-400 space-y-1">
                <p>Created {formatDate(task.createdAt)}</p>
                <p>Updated {formatDate(task.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

