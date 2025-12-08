"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, CheckSquare, Clock, AlertCircle } from "lucide-react";
import { cn, TASK_STATUSES, TASK_PRIORITIES } from "@/lib/utils";
import Link from "next/link";

interface TaskFiltersProps {
  stats: {
    total: number;
    open: number;
    inProgress: number;
    complete: number;
    overdue: number;
  };
  projects: Array<{ id: string; name: string }>;
}

export function TaskFilters({ stats, projects }: TaskFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") || "all";
  const currentPriority = searchParams.get("priority") || "all";
  const currentProject = searchParams.get("project") || "all";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/tasks?${params.toString()}`);
  };

  const quickFilters = [
    { value: "all", label: "All Tasks", count: stats.total, icon: CheckSquare },
    { value: "OPEN", label: "Open", count: stats.open, icon: Clock },
    { value: "IN_PROGRESS", label: "In Progress", count: stats.inProgress, icon: Clock },
    { value: "overdue", label: "Overdue", count: stats.overdue, icon: AlertCircle, alert: stats.overdue > 0 },
  ];

  return (
    <div className="space-y-4">
      {/* Quick Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {quickFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={
              (filter.value === "overdue" && currentStatus === "all" && stats.overdue > 0) 
                ? "warning" 
                : currentStatus === filter.value 
                  ? "default" 
                  : "outline"
            }
            size="sm"
            onClick={() => updateFilter("status", filter.value === "overdue" ? "all" : filter.value)}
            className={cn(
              "gap-2",
              filter.alert && "ring-2 ring-red-100"
            )}
          >
            <filter.icon className="w-4 h-4" />
            {filter.label}
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded-full",
              currentStatus === filter.value 
                ? "bg-white/20" 
                : filter.alert 
                  ? "bg-red-100 text-red-700"
                  : "bg-stone-100"
            )}>
              {filter.count}
            </span>
          </Button>
        ))}
      </div>

      {/* Detailed Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={currentStatus} onValueChange={(v) => updateFilter("status", v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(TASK_STATUSES).map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={currentPriority} onValueChange={(v) => updateFilter("priority", v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {Object.entries(TASK_PRIORITIES).map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={currentProject} onValueChange={(v) => updateFilter("project", v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Link href="/tasks/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        </Link>
      </div>
    </div>
  );
}

