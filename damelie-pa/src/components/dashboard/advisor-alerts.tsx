"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  Pause,
  ChevronRight,
  DollarSign,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { AdvisorAlert } from "@/lib/advisor-alerts";

interface AdvisorAlertsProps {
  alerts: AdvisorAlert[];
  compact?: boolean;
}

const alertIcons = {
  workload: Clock,
  margin: TrendingDown,
  stalled: Pause,
  overdue_payment: DollarSign,
};

const severityColors = {
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "text-amber-500",
    badge: "bg-amber-100 text-amber-700",
  },
  critical: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "text-red-500",
    badge: "bg-red-100 text-red-700",
  },
};

export function AdvisorAlerts({ alerts, compact = false }: AdvisorAlertsProps) {
  if (alerts.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-green-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-900">All Clear!</h3>
              <p className="text-sm text-emerald-700">No alerts or warnings at this time.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const criticalAlerts = alerts.filter(a => a.severity === "critical");
  const warningAlerts = alerts.filter(a => a.severity === "warning");

  return (
    <Card className={cn(
      "border-0 shadow-sm overflow-hidden",
      criticalAlerts.length > 0 && "ring-2 ring-red-200"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Advisor Alerts
            {alerts.length > 0 && (
              <Badge className={cn(
                criticalAlerts.length > 0 
                  ? "bg-red-100 text-red-700" 
                  : "bg-amber-100 text-amber-700"
              )}>
                {alerts.length}
              </Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {alerts.slice(0, compact ? 3 : undefined).map((alert, index) => {
            const Icon = alertIcons[alert.type] || AlertTriangle;
            const colors = severityColors[alert.severity];

            return (
              <div
                key={alert.id}
                className={cn(
                  "p-4 rounded-xl border animate-fade-in",
                  colors.bg,
                  colors.border
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    colors.bg
                  )}>
                    <Icon className={cn("w-4 h-4", colors.icon)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-stone-900">
                        {alert.title}
                      </h4>
                      <Badge className={colors.badge}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-stone-600 mb-2">
                      {alert.description}
                    </p>
                    {alert.action && (
                      <Link href={alert.action.href}>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                          {alert.action.label}
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {compact && alerts.length > 3 && (
            <Link 
              href="/alerts"
              className="flex items-center justify-center gap-1 text-xs text-stone-500 hover:text-stone-700 py-2"
            >
              View {alerts.length - 3} more alerts
              <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
