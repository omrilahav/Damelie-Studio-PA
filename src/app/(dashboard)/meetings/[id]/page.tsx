import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MeetingPrepButton } from "@/components/meetings/meeting-prep-button";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  FileText,
  FolderOpen,
  Sparkles
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

interface MeetingPageProps {
  params: Promise<{ id: string }>;
}

const typeConfig: Record<string, { label: string; color: string }> = {
  MEETING: { label: "Meeting", color: "bg-blue-100 text-blue-700" },
  SITE_VISIT: { label: "Site Visit", color: "bg-emerald-100 text-emerald-700" },
  CALL: { label: "Call", color: "bg-amber-100 text-amber-700" },
};

async function getMeeting(id: string) {
  return db.meeting.findUnique({
    where: { id },
    include: {
      project: {
        include: {
          client: true,
        },
      },
      extractedTasks: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export default async function MeetingPage({ params }: MeetingPageProps) {
  const { id } = await params;
  const meeting = await getMeeting(id);

  if (!meeting) {
    notFound();
  }

  const type = typeConfig[meeting.type] || { label: meeting.type, color: "bg-stone-100 text-stone-700" };
  const isPast = new Date(meeting.date) < new Date();

  return (
    <>
      <Header 
        title={meeting.title} 
        subtitle={meeting.project?.name || "No project"}
      />
      
      <div className="p-6 space-y-6">
        {/* Back link and type */}
        <div className="flex items-center justify-between">
          <Link href="/meetings" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700">
            <ArrowLeft className="w-4 h-4" />
            Back to Meetings
          </Link>
          <span className={cn("px-3 py-1 rounded-full text-sm font-medium", type.color)}>
            {type.label}
          </span>
        </div>

        {/* Meeting Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Meeting Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-stone-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-stone-500">Date</p>
                    <p className={cn(
                      "text-sm font-medium",
                      isPast && "text-stone-400"
                    )}>
                      {formatDate(meeting.date)}
                      {isPast && " (Past)"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-stone-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-stone-500">Type</p>
                    <p className="text-sm font-medium">{type.label}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-1.5",
                    meeting.confirmed ? "bg-emerald-500" : "bg-amber-500"
                  )} />
                  <div>
                    <p className="text-xs text-stone-500">Status</p>
                    <p className="text-sm font-medium">{meeting.confirmed ? "Confirmed" : "Pending Confirmation"}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex gap-2">
                <Link href={`/meetings/${meeting.id}/edit`}>
                  <Button variant="outline" size="sm">Edit Meeting</Button>
                </Link>
                <MeetingPrepButton meetingId={meeting.id} />
              </div>
            </CardContent>
          </Card>

          {/* Project Info */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-stone-400" />
                Project
              </CardTitle>
            </CardHeader>
            <CardContent>
              {meeting.project ? (
                <Link
                  href={`/projects/${meeting.project.id}`}
                  className="block p-3 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
                >
                  <p className="text-sm font-medium">{meeting.project.name}</p>
                  {meeting.project.client && (
                    <p className="text-xs text-stone-500 mt-1">{meeting.project.client.name}</p>
                  )}
                  {meeting.project.location && (
                    <p className="text-xs text-stone-400">{meeting.project.location}</p>
                  )}
                </Link>
              ) : (
                <p className="text-sm text-stone-500 text-center py-4">No project assigned</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        {meeting.rawNotes && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-stone-400" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm prose-stone max-w-none">
                <p className="text-sm text-stone-700 whitespace-pre-wrap">{meeting.rawNotes}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Summary */}
        {meeting.summary && (
          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm prose-stone max-w-none">
                <p className="text-sm text-stone-700 whitespace-pre-wrap">{meeting.summary}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Extracted Tasks */}
        {meeting.extractedTasks.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Action Items from Meeting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {meeting.extractedTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg bg-stone-50 hover:bg-stone-100 transition-colors"
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      task.status === "COMPLETE" ? "bg-emerald-500" : 
                      task.status === "IN_PROGRESS" ? "bg-blue-500" : "bg-stone-300"
                    )} />
                    <span className={cn(
                      "text-sm flex-1",
                      task.status === "COMPLETE" && "line-through text-stone-400"
                    )}>
                      {task.title}
                    </span>
                    {task.dueDate && (
                      <span className="text-xs text-stone-400">
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

