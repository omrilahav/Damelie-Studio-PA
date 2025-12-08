"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CheckSquare, 
  Clock, 
  DollarSign,
  FileText,
  AlertCircle,
  ChevronRight,
  MoreHorizontal 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, TASK_STATUSES, TASK_PRIORITIES, formatRelativeDate, isOverdue } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  project: {
    id: string;
    name: string;
    client: { name: string } | null;
  } | null;
  _count: {
    reminders: number;
  };
}

interface TasksListProps {
  tasks: Task[];
}

const priorityIcons = {
  URGENT_PAYMENT: DollarSign,
  BOQ_OFFER: FileText,
  REPORT: FileText,
  OPPORTUNITY: AlertCircle,
  NORMAL: Clock,
};

export function TasksList({ tasks }: TasksListProps) {
  const [completing, setCompleting] = useState<string | null>(null);

  const handleComplete = async (taskId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCompleting(taskId);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETE" }),
      });

      if (!response.ok) throw new Error();
      toast.success("Task completed!");
      window.location.reload();
    } catch {
      toast.error("Failed to complete task");
    } finally {
      setCompleting(null);
    }
  };

  if (tasks.length === 0) {
    return (
      <Card className="border-0 shadow-sm p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <CheckSquare className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="font-semibold text-stone-900 mb-2">No tasks found</h3>
        <p className="text-sm text-stone-500 mb-4">
          Create your first task to get started
        </p>
        <Link
          href="/tasks/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
        >
          Create Task
        </Link>
      </Card>
    );
  }

  // Group tasks by status
  const groupedTasks = tasks.reduce((acc, task) => {
    const status = task.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedTasks).map(([status, statusTasks]) => {
        const statusConfig = TASK_STATUSES[status as keyof typeof TASK_STATUSES];
        
        return (
          <div key={status}>
            <div className="flex items-center gap-2 mb-3">
              <Badge className={statusConfig?.color || "bg-stone-100 text-stone-700"}>
                {statusConfig?.label || status}
              </Badge>
              <span className="text-sm text-stone-400">
                {statusTasks.length} tasks
              </span>
            </div>
            
            <div className="space-y-2">
              {statusTasks.map((task, index) => {
                const priorityConfig = TASK_PRIORITIES[task.priority as keyof typeof TASK_PRIORITIES];
                const Icon = priorityIcons[task.priority as keyof typeof priorityIcons] || Clock;
                const overdue = task.dueDate ? isOverdue(task.dueDate) : false;
                const isComplete = task.status === "COMPLETE";

                return (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className={cn(
                      "group flex items-center gap-3 p-4 rounded-xl transition-all animate-fade-in",
                      "bg-white border border-stone-100 hover:border-stone-200 hover:shadow-sm",
                      task.priority === "URGENT_PAYMENT" && "priority-urgent",
                      task.priority === "BOQ_OFFER" && "priority-high",
                      overdue && "ring-1 ring-red-100"
                    )}
                    style={{ animationDelay: `${index * 0.02}s` }}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={(e) => !isComplete && handleComplete(task.id, e)}
                      disabled={isComplete || completing === task.id}
                      className={cn(
                        "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                        isComplete 
                          ? "bg-emerald-500 border-emerald-500 text-white" 
                          : "border-stone-300 hover:border-stone-400"
                      )}
                    >
                      {isComplete && <CheckSquare className="w-3 h-3" />}
                    </button>

                    {/* Priority Icon */}
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      priorityConfig?.color.split(" ")[0] || "bg-stone-100"
                    )}>
                      <Icon className={cn(
                        "w-4 h-4",
                        priorityConfig?.color.split(" ")[1] || "text-stone-500"
                      )} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium text-sm truncate",
                        isComplete ? "text-stone-400 line-through" : "text-stone-900"
                      )}>
                        {task.title}
                      </p>
                      {task.project && (
                        <p className="text-xs text-stone-500 truncate">
                          {task.project.name}
                          {task.project.client && ` · ${task.project.client.name}`}
                        </p>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-2 shrink-0">
                      {task.dueDate && (
                        <span className={cn(
                          "text-xs font-medium px-2 py-1 rounded-lg",
                          overdue 
                            ? "bg-red-100 text-red-700" 
                            : "bg-stone-100 text-stone-600"
                        )}>
                          {formatRelativeDate(task.dueDate)}
                        </span>
                      )}
                      <Badge className={priorityConfig?.color || "bg-stone-100 text-stone-700"}>
                        {priorityConfig?.label || task.priority}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

