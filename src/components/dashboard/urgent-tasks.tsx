"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  FileText,
  ChevronRight 
} from "lucide-react";
import { cn, TASK_PRIORITIES, formatRelativeDate, isOverdue } from "@/lib/utils";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: Date | null;
  project: {
    id: string;
    name: string;
  } | null;
}

interface UrgentTasksProps {
  tasks: Task[];
}

const priorityIcons = {
  URGENT_PAYMENT: DollarSign,
  BOQ_OFFER: FileText,
  REPORT: FileText,
  OPPORTUNITY: AlertCircle,
  NORMAL: Clock,
};

export function UrgentTasks({ tasks }: UrgentTasksProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            Urgent & Due Soon
          </CardTitle>
          <Link 
            href="/tasks" 
            className="text-xs text-stone-500 hover:text-stone-700 flex items-center gap-1"
          >
            View all tasks
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-sm text-stone-600 font-medium">All caught up!</p>
            <p className="text-xs text-stone-400 mt-1">No urgent tasks right now</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task, index) => {
              const priorityConfig = TASK_PRIORITIES[task.priority as keyof typeof TASK_PRIORITIES] || TASK_PRIORITIES.NORMAL;
              const Icon = priorityIcons[task.priority as keyof typeof priorityIcons] || Clock;
              const overdue = task.dueDate ? isOverdue(task.dueDate) : false;

              return (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-colors animate-fade-in",
                    "hover:bg-stone-50",
                    task.priority === "URGENT_PAYMENT" && "priority-urgent bg-red-50/50",
                    task.priority === "BOQ_OFFER" && "priority-high bg-orange-50/50",
                    task.priority !== "URGENT_PAYMENT" && task.priority !== "BOQ_OFFER" && "bg-white border border-stone-100"
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    priorityConfig.color.split(" ")[0]
                  )}>
                    <Icon className={cn("w-4 h-4", priorityConfig.color.split(" ")[1])} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-stone-900 truncate">
                      {task.title}
                    </p>
                    {task.project && (
                      <p className="text-xs text-stone-500 truncate">
                        {task.project.name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {task.dueDate && (
                      <span className={cn(
                        "text-xs font-medium",
                        overdue ? "text-red-600" : "text-stone-500"
                      )}>
                        {formatRelativeDate(task.dueDate)}
                      </span>
                    )}
                    <Badge className={priorityConfig.color}>
                      {priorityConfig.label}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

