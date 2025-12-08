"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Send, 
  X, 
  CheckCircle2, 
  Clock,
  Sparkles,
  RefreshCw,
  Copy,
  Mail
} from "lucide-react";
import { cn, formatDate, truncate } from "@/lib/utils";
import { toast } from "sonner";

interface Reminder {
  id: string;
  message: string;
  status: string;
  recipient: string | null;
  createdAt: Date;
  sentAt: Date | null;
  task: {
    id: string;
    title: string;
    dueDate: Date | null;
    project: {
      id: string;
      name: string;
      client: { name: string; email: string | null } | null;
    } | null;
  };
}

interface RemindersListProps {
  reminders: Reminder[];
  stats: {
    draft: number;
    approved: number;
    sent: number;
  };
}

export function RemindersList({ reminders, stats }: RemindersListProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });
      if (!response.ok) throw new Error();
      toast.success("Reminder approved");
      window.location.reload();
    } catch {
      toast.error("Failed to approve reminder");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendEmail = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderId: id }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to send");
      }
      
      toast.success(data.message || "Email sent!");
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send email");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (!response.ok) throw new Error();
      toast.success("Reminder cancelled");
      window.location.reload();
    } catch {
      toast.error("Failed to cancel reminder");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopy = (message: string) => {
    navigator.clipboard.writeText(message);
    toast.success("Message copied to clipboard");
  };

  const draftReminders = reminders.filter(r => r.status === "DRAFT");
  const approvedReminders = reminders.filter(r => r.status === "APPROVED");
  const sentReminders = reminders.filter(r => r.status === "SENT");

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats.draft}</p>
              <p className="text-sm text-stone-500">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="border-0 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats.approved}</p>
              <p className="text-sm text-stone-500">Approved</p>
            </div>
          </div>
        </Card>
        <Card className="border-0 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Send className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats.sent}</p>
              <p className="text-sm text-stone-500">Sent</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="draft">
        <TabsList>
          <TabsTrigger value="draft" className="gap-2">
            <Clock className="w-4 h-4" />
            Pending ({stats.draft})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Approved ({stats.approved})
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2">
            <Send className="w-4 h-4" />
            Sent ({stats.sent})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="draft">
          <ReminderCards 
            reminders={draftReminders} 
            onApprove={handleApprove}
            onCancel={handleCancel}
            onCopy={handleCopy}
            actionLoading={actionLoading}
            showActions
          />
        </TabsContent>

        <TabsContent value="approved">
          <ReminderCards 
            reminders={approvedReminders}
            onCopy={handleCopy}
            onSend={handleSendEmail}
            actionLoading={actionLoading}
            showSendButton
          />
        </TabsContent>

        <TabsContent value="sent">
          <ReminderCards 
            reminders={sentReminders}
            onCopy={handleCopy}
            actionLoading={actionLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReminderCards({
  reminders,
  onApprove,
  onCancel,
  onCopy,
  onSend,
  actionLoading,
  showActions = false,
  showSendButton = false,
}: {
  reminders: Reminder[];
  onApprove?: (id: string) => void;
  onCancel?: (id: string) => void;
  onCopy: (message: string) => void;
  onSend?: (id: string) => void;
  actionLoading: string | null;
  showActions?: boolean;
  showSendButton?: boolean;
}) {
  if (reminders.length === 0) {
    return (
      <Card className="border-0 shadow-sm p-8 text-center">
        <Bell className="w-8 h-8 text-stone-300 mx-auto mb-3" />
        <p className="text-stone-500">No reminders in this category</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {reminders.map((reminder, index) => (
        <Card
          key={reminder.id}
          className={cn(
            "border-0 shadow-sm animate-fade-in",
            reminder.status === "DRAFT" && "border-l-4 border-l-amber-400"
          )}
          style={{ animationDelay: `${index * 0.03}s` }}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-semibold text-stone-900">
                  {reminder.task.title}
                </h3>
                <p className="text-sm text-stone-500">
                  {reminder.task.project?.name}
                  {reminder.task.project?.client && 
                    ` · ${reminder.task.project.client.name}`}
                </p>
              </div>
              <Badge 
                variant={
                  reminder.status === "DRAFT" ? "warning" :
                  reminder.status === "APPROVED" ? "info" :
                  "success"
                }
              >
                {reminder.status}
              </Badge>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 mb-4">
              <p className="text-sm text-stone-700 whitespace-pre-wrap">
                {reminder.message}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-stone-400">
                Created {formatDate(reminder.createdAt)}
                {reminder.sentAt && ` · Sent ${formatDate(reminder.sentAt)}`}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onCopy(reminder.message)}
                  className="gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </Button>

                {showSendButton && onSend && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => onSend(reminder.id)}
                    disabled={actionLoading === reminder.id}
                    className="gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Send Email
                  </Button>
                )}

                {showActions && onApprove && onCancel && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCancel(reminder.id)}
                      disabled={actionLoading === reminder.id}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => onApprove(reminder.id)}
                      disabled={actionLoading === reminder.id}
                      className="gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

