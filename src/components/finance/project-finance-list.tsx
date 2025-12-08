import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  AlertTriangle, 
  TrendingUp,
  ChevronRight 
} from "lucide-react";
import { cn, formatCurrency, PROJECT_STATUSES } from "@/lib/utils";
import Link from "next/link";

interface ProjectWithFinance {
  id: string;
  name: string;
  status: string;
  client: { name: string } | null;
  finance: {
    budget: number;
    invoiced: number;
    paid: number;
    costs: number;
    margin: number;
    atRisk: boolean;
    outstanding: number;
  };
}

interface ProjectFinanceListProps {
  projects: ProjectWithFinance[];
}

export function ProjectFinanceList({ projects }: ProjectFinanceListProps) {
  if (projects.length === 0) {
    return (
      <Card className="border-0 shadow-sm p-8 text-center">
        <Building2 className="w-8 h-8 text-stone-300 mx-auto mb-3" />
        <p className="text-stone-500">No active projects with financial data</p>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Project Finances</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project, index) => {
            const statusConfig = PROJECT_STATUSES[project.status as keyof typeof PROJECT_STATUSES];
            const invoicedPercent = project.finance.budget > 0 
              ? (project.finance.invoiced / project.finance.budget) * 100 
              : 0;
            const collectedPercent = project.finance.invoiced > 0
              ? (project.finance.paid / project.finance.invoiced) * 100
              : 0;

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className={cn(
                  "group block p-4 rounded-xl border transition-all animate-fade-in",
                  project.finance.atRisk 
                    ? "border-red-200 bg-red-50/30 hover:bg-red-50" 
                    : "border-stone-100 hover:border-stone-200 hover:shadow-sm"
                )}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">
                        {project.name}
                      </h3>
                      {project.finance.atRisk && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-stone-500">
                      {project.client?.name || "No client"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusConfig?.color || "bg-stone-100"}>
                      {statusConfig?.label || project.status}
                    </Badge>
                    <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-stone-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-stone-500">Budget</p>
                    <p className="font-semibold text-stone-900">
                      {formatCurrency(project.finance.budget)}
                    </p>
                  </div>
                  <div>
                    <p className="text-stone-500">Invoiced</p>
                    <p className="font-semibold text-amber-600">
                      {formatCurrency(project.finance.invoiced)}
                    </p>
                    <Progress 
                      value={invoicedPercent} 
                      className="h-1 mt-1"
                      indicatorClassName="bg-amber-500"
                    />
                  </div>
                  <div>
                    <p className="text-stone-500">Collected</p>
                    <p className="font-semibold text-emerald-600">
                      {formatCurrency(project.finance.paid)}
                    </p>
                    <Progress 
                      value={collectedPercent} 
                      className="h-1 mt-1"
                      indicatorClassName="bg-emerald-500"
                    />
                  </div>
                  <div>
                    <p className="text-stone-500">Margin</p>
                    <p className={cn(
                      "font-semibold flex items-center gap-1",
                      project.finance.atRisk ? "text-red-600" : "text-purple-600"
                    )}>
                      {project.finance.atRisk ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : (
                        <TrendingUp className="w-3 h-3" />
                      )}
                      {Math.round(project.finance.margin)}%
                    </p>
                  </div>
                </div>

                {project.finance.outstanding > 0 && (
                  <div className="mt-3 pt-3 border-t border-stone-100">
                    <p className="text-xs text-amber-600 font-medium">
                      {formatCurrency(project.finance.outstanding)} outstanding
                    </p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

