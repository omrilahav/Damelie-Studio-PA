import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FolderKanban, 
  ChevronRight, 
  Building2,
  MapPin 
} from "lucide-react";
import { cn, PROJECT_STATUSES, formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  status: string;
  location: string | null;
  budget: number | null;
  client: {
    id: string;
    name: string;
  } | null;
  _count: {
    tasks: number;
  };
}

interface ProjectsOverviewProps {
  projects: Project[];
}

export function ProjectsOverview({ projects }: ProjectsOverviewProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-stone-400" />
            Active Projects
          </CardTitle>
          <Link 
            href="/projects" 
            className="text-xs text-stone-500 hover:text-stone-700 flex items-center gap-1"
          >
            View all projects
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {projects.length === 0 ? (
          <div className="text-center py-12 empty-state">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="font-medium text-stone-900 mb-1">No active projects</h3>
            <p className="text-sm text-stone-500 mb-4">
              Get started by creating your first project
            </p>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
            >
              Create Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, index) => {
              const statusConfig = PROJECT_STATUSES[project.status as keyof typeof PROJECT_STATUSES] || PROJECT_STATUSES.LEAD;
              
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className={cn(
                    "group block p-4 rounded-xl border border-stone-100 bg-white hover:border-stone-200 hover:shadow-md transition-all animate-fade-in card-hover"
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-stone-900 truncate group-hover:text-stone-700">
                        {project.name}
                      </h3>
                      {project.client && (
                        <p className="text-sm text-stone-500 truncate">
                          {project.client.name}
                        </p>
                      )}
                    </div>
                    <Badge className={statusConfig.color}>
                      {statusConfig.label}
                    </Badge>
                  </div>

                  {project.location && (
                    <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-3">
                      <MapPin className="w-3 h-3" />
                      {project.location}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-500">
                      {project._count.tasks} tasks
                    </span>
                    {project.budget && (
                      <span className="font-medium text-stone-700">
                        {formatCurrency(project.budget)}
                      </span>
                    )}
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

