import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Wallet, 
  Receipt, 
  CreditCard, 
  TrendingUp,
  AlertTriangle 
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface FinanceOverviewProps {
  totals: {
    budget: number;
    invoiced: number;
    paid: number;
    costs: number;
    outstanding: number;
    margin: number;
  };
}

export function FinanceOverview({ totals }: FinanceOverviewProps) {
  const stats = [
    {
      label: "Total Budget",
      value: formatCurrency(totals.budget),
      icon: Wallet,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Invoiced",
      value: formatCurrency(totals.invoiced),
      subtext: `${totals.budget > 0 ? Math.round((totals.invoiced / totals.budget) * 100) : 0}% of budget`,
      icon: Receipt,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "Collected",
      value: formatCurrency(totals.paid),
      subtext: `${formatCurrency(totals.outstanding)} outstanding`,
      icon: CreditCard,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Average Margin",
      value: `${Math.round(totals.margin)}%`,
      icon: totals.margin < 15 ? AlertTriangle : TrendingUp,
      color: totals.margin < 15 ? "text-red-600" : "text-purple-600",
      bgColor: totals.margin < 15 ? "bg-red-50" : "bg-purple-50",
      alert: totals.margin < 15,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card 
          key={stat.label}
          className={cn(
            "border-0 shadow-sm p-5 animate-fade-in",
            stat.alert && "ring-2 ring-red-100"
          )}
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-stone-500 mb-1">{stat.label}</p>
              <p className={cn("text-2xl font-bold", stat.color)}>
                {stat.value}
              </p>
              {stat.subtext && (
                <p className="text-xs text-stone-400 mt-1">{stat.subtext}</p>
              )}
            </div>
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              stat.bgColor
            )}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

