"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Send, X, ChevronRight } from "lucide-react";
import { cn, truncate } from "@/lib/utils";
import Link from "next/link";

interface Reminder {
  id: string;
  message: string;
  status: string;
  task: {
    id: string;
    title: string;
    project: {
      id: string;
      name: string;
    } | null;
  };
}

interface PendingRemindersProps {
  reminders: Reminder[];
}

export function PendingReminders({ reminders }: PendingRemindersProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            Pending Reminders
            {reminders.length > 0 && (
              <Badge variant="warning" className="ml-1">
                {reminders.length}
              </Badge>
            )}
          </CardTitle>
          <Link 
            href="/reminders" 
            className="text-xs text-stone-500 hover:text-stone-700"
          >
            Manage
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {reminders.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-3">
              <Bell className="w-6 h-6 text-stone-300" />
            </div>
            <p className="text-sm text-stone-500">No pending reminders</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.slice(0, 3).map((reminder, index) => (
              <div
                key={reminder.id}
                className={cn(
                  "p-3 rounded-xl bg-amber-50/50 border border-amber-100 animate-fade-in"
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-medium text-sm text-stone-900">
                      {reminder.task.title}
                    </p>
                    {reminder.task.project && (
                      <p className="text-xs text-stone-500">
                        {reminder.task.project.name}
                      </p>
                    )}
                  </div>
                  <Badge variant="warning" className="shrink-0">
                    Draft
                  </Badge>
                </div>
                <p className="text-xs text-stone-600 mb-3 line-clamp-2">
                  {truncate(reminder.message, 100)}
                </p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="success" className="h-7 text-xs gap-1.5">
                    <Send className="w-3 h-3" />
                    Approve & Send
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}

            {reminders.length > 3 && (
              <Link
                href="/reminders"
                className="flex items-center justify-center gap-1 text-xs text-stone-500 hover:text-stone-700 py-2"
              >
                View {reminders.length - 3} more reminders
                <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

