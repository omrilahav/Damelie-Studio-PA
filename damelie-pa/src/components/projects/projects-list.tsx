"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  MapPin, 
  CheckSquare, 
  Calendar,
  ChevronRight,
  ExternalLink 
} from "lucide-react";
import { cn, PROJECT_STATUSES, formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  status: string;
  location: string | null;
  budget: number | null;
  startDate: Date | null;
  endDate: Date | null;
  driveFolder: string | null;
  client: {
    id: string;
    name: string;
  } | null;
  _count: {
    tasks: number;
    meetings: number;
  };
}

interface ProjectsListProps {
  projects: Project[];
}

export function ProjectsList({ projects }: ProjectsListProps) {
  if (projects.length === 0) {
    return (
      <Card className="border-0 shadow-sm p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-stone-400" />
        </div>
        <h3 className="font-semibold text-stone-900 mb-2">No projects found</h3>
        <p className="text-sm text-stone-500 mb-4">
          Get started by creating your first project
        </p>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
        >
          Create Project
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {projects.map((project, index) => {
        const statusConfig = PROJECT_STATUSES[project.status as keyof typeof PROJECT_STATUSES] || PROJECT_STATUSES.LEAD;
        
        return (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className={cn(
              "group block animate-fade-in"
            )}
            style={{ animationDelay: `${index * 0.03}s` }}
          >
            <Card className="border-0 shadow-sm p-5 hover:shadow-md transition-all card-hover">
              <div className="flex items-start gap-4">
                {/* Project Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-stone-400 group-hover:text-stone-600 transition-colors" />
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-stone-900 group-hover:text-stone-700 truncate">
                        {project.name}
                      </h3>
                      {project.client && (
                        <p className="text-sm text-stone-500">
                          {project.client.name}
                        </p>
                      )}
                    </div>
                    <Badge className={cn(statusConfig.color, "shrink-0")}>
                      {statusConfig.label}
                    </Badge>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-stone-500">
                    {project.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-stone-400" />
                        {project.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-stone-400" />
                      {project._count.tasks} tasks
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-stone-400" />
                      {project._count.meetings} meetings
                    </div>
                    {project.budget && (
                      <div className="font-medium text-stone-700">
                        {formatCurrency(project.budget)}
                      </div>
                    )}
                  </div>

                  {/* Date Range */}
                  {(project.startDate || project.endDate) && (
                    <div className="mt-2 text-xs text-stone-400">
                      {project.startDate && formatDate(project.startDate)}
                      {project.startDate && project.endDate && " → "}
                      {project.endDate && formatDate(project.endDate)}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {project.driveFolder && (
                    <a
                      href={project.driveFolder}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-stone-500 transition-colors" />
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

