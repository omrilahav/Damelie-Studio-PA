import { Card } from "@/components/ui/card";
import { 
  FolderKanban, 
  CheckSquare, 
  AlertCircle,
  TrendingUp 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickStatsProps {
  stats: {
    activeProjects: number;
    totalTasks: number;
    completedTasks: number;
    overdueCount: number;
  };
}

export function QuickStats({ stats }: QuickStatsProps) {
  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  const statItems = [
    {
      label: "Active Projects",
      value: stats.activeProjects,
      icon: FolderKanban,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Tasks Completed",
      value: `${stats.completedTasks}/${stats.totalTasks}`,
      subtext: `${completionRate}% done`,
      icon: CheckSquare,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Overdue Items",
      value: stats.overdueCount,
      icon: AlertCircle,
      color: stats.overdueCount > 0 ? "text-red-600" : "text-stone-400",
      bgColor: stats.overdueCount > 0 ? "bg-red-50" : "bg-stone-50",
      alert: stats.overdueCount > 0,
    },
    {
      label: "This Week",
      value: "On Track",
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <Card 
          key={item.label} 
          className={cn(
            "p-5 border-0 shadow-sm animate-fade-in",
            item.alert && "ring-2 ring-red-100"
          )}
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-stone-500 mb-1">{item.label}</p>
              <p className={cn(
                "text-2xl font-bold",
                item.color
              )}>
                {item.value}
              </p>
              {item.subtext && (
                <p className="text-xs text-stone-400 mt-0.5">{item.subtext}</p>
              )}
            </div>
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              item.bgColor
            )}>
              <item.icon className={cn("w-5 h-5", item.color)} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

