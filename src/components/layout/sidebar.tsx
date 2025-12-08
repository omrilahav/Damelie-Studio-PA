"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CheckSquare,
  Calendar,
  Bell,
  Receipt,
  FileSpreadsheet,
  Settings,
  Sparkles,
  AlertCircle,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Tasks", href: "/tasks", icon: CheckSquare, badgeKey: "overdue" },
  { name: "Meetings", href: "/meetings", icon: Calendar },
  { name: "Reminders", href: "/reminders", icon: Bell, badgeKey: "reminders" },
  { name: "Finance", href: "/finance", icon: Receipt },
  { name: "BoQ Helper", href: "/boq", icon: FileSpreadsheet },
];

const secondaryNav = [
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  pendingReminders?: number;
  overdueTasksCount?: number;
}

export function Sidebar({ pendingReminders = 0, overdueTasksCount = 0 }: SidebarProps) {
  const pathname = usePathname();

  const getBadgeCount = (key?: string) => {
    if (key === "reminders") return pendingReminders;
    if (key === "overdue") return overdueTasksCount;
    return 0;
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-stone-200/60 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-stone-100">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-stone-800 to-stone-900 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold text-stone-900 tracking-tight">
              Damelie
            </h1>
            <p className="text-[10px] text-stone-400 -mt-0.5 tracking-wider uppercase">
              Personal Assistant
            </p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="mb-2">
          <p className="px-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            Main
          </p>
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href));
          const badgeCount = getBadgeCount(item.badgeKey);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-stone-900 text-white shadow-md"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-amber-300" : "text-stone-400"
              )} />
              {item.name}
              {badgeCount > 0 && (
                <span className={cn(
                  "ml-auto text-xs px-2 py-0.5 rounded-full",
                  item.badgeKey === "overdue" 
                    ? (isActive ? "bg-red-400/20 text-red-300" : "bg-red-100 text-red-600")
                    : (isActive ? "bg-amber-400/20 text-amber-300" : "bg-amber-100 text-amber-600")
                )}>
                  {badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className="px-3 py-4 border-t border-stone-100">
        {secondaryNav.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-stone-100 text-stone-900"
                  : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
              )}
            >
              <item.icon className="w-5 h-5 text-stone-400" />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* User / Quick Info */}
      <div className="px-4 py-4 border-t border-stone-100 bg-stone-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <span className="text-sm font-semibold text-amber-700">DS</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-stone-900 truncate">
              Damelie Studio
            </p>
            <p className="text-xs text-stone-500">
              Mallorca, Spain
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

