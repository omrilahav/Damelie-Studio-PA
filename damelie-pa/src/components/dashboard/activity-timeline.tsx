"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  FolderKanban, 
  CheckSquare, 
  Calendar, 
  User,
  FileText,
  Bell,
  DollarSign,
  Plus,
  Edit,
  Check,
  X
} from "lucide-react";
import { cn, formatRelativeDate } from "@/lib/utils";

interface ActivityLogItem {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  description: string;
  metadata?: string | null;
  createdAt: Date;
}

interface ActivityTimelineProps {
  activities: ActivityLogItem[];
  title?: string;
  showViewAll?: boolean;
  maxItems?: number;
}

const entityIcons: Record<string, React.ElementType> = {
  PROJECT: FolderKanban,
  TASK: CheckSquare,
  MEETING: Calendar,
  CLIENT: User,
  REMINDER: Bell,
  BOQ: FileText,
  FINANCIAL: DollarSign,
};

const actionIcons: Record<string, React.ElementType> = {
  CREATED: Plus,
  UPDATED: Edit,
  COMPLETED: Check,
  CANCELLED: X,
};

const actionColors: Record<string, string> = {
  CREATED: "bg-emerald-100 text-emerald-700",
  UPDATED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export function ActivityTimeline({ 
  activities, 
  title = "Recent Activity",
  showViewAll = false,
  maxItems = 10
}: ActivityTimelineProps) {
  const displayedActivities = activities.slice(0, maxItems);

  if (activities.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-stone-400" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="w-8 h-8 text-stone-300 mx-auto mb-3" />
            <p className="text-sm text-stone-500">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-stone-400" />
            {title}
          </CardTitle>
          {showViewAll && activities.length > maxItems && (
            <span className="text-xs text-stone-400">
              Showing {maxItems} of {activities.length}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-2 bottom-2 w-px bg-stone-200" />
          
          <div className="space-y-4">
            {displayedActivities.map((activity, index) => {
              const EntityIcon = entityIcons[activity.entityType] || FileText;
              const ActionIcon = actionIcons[activity.action] || Edit;
              const actionColor = actionColors[activity.action] || "bg-stone-100 text-stone-700";

              return (
                <div 
                  key={activity.id}
                  className={cn(
                    "relative pl-10 animate-fade-in"
                  )}
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  {/* Timeline dot */}
                  <div className={cn(
                    "absolute left-2 w-5 h-5 rounded-full flex items-center justify-center",
                    actionColor
                  )}>
                    <ActionIcon className="w-3 h-3" />
                  </div>
                  
                  <div className="p-3 rounded-lg bg-stone-50 hover:bg-stone-100 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <EntityIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <Badge variant="secondary" className="text-xs">
                            {activity.entityType}
                          </Badge>
                        </div>
                        <p className="text-sm text-stone-700 line-clamp-2">
                          {activity.description}
                        </p>
                      </div>
                      <span className="text-xs text-stone-400 shrink-0">
                        {formatRelativeDate(activity.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
