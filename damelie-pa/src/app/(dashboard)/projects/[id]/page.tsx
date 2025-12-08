import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { TimeLogger } from "@/components/projects/time-logger";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  ExternalLink,
  CheckCircle2,
  User,
  FileText,
  AlertCircle
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  LEAD: { label: "Lead", color: "bg-blue-100 text-blue-700" },
  NEGOTIATION: { label: "Negotiation", color: "bg-amber-100 text-amber-700" },
  ACTIVE: { label: "Active", color: "bg-emerald-100 text-emerald-700" },
  ON_HOLD: { label: "On Hold", color: "bg-stone-100 text-stone-700" },
  CLOSED_WON: { label: "Completed", color: "bg-green-100 text-green-700" },
  CLOSED_LOST: { label: "Lost", color: "bg-red-100 text-red-700" },
};

async function getProject(id: string) {
  return db.project.findUnique({
    where: { id },
    include: {
      client: true,
      tasks: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      meetings: {
        orderBy: { date: "desc" },
        take: 5,
      },
      financialEntries: {
        orderBy: { date: "desc" },
      },
      _count: {
        select: {
          tasks: true,
          meetings: true,
          boqItems: true,
        },
      },
    },
  });
}

async function getProjectActivity(projectId: string) {
  return db.activityLog.findMany({
    where: {
      OR: [
        { entityId: projectId, entityType: "PROJECT" },
        {
          entityId: {
            in: await db.task
              .findMany({ where: { projectId }, select: { id: true } })
              .then(tasks => tasks.map(t => t.id)),
          },
          entityType: "TASK",
        },
        {
          entityId: {
            in: await db.meeting
              .findMany({ where: { projectId }, select: { id: true } })
              .then(meetings => meetings.map(m => m.id)),
          },
          entityType: "MEETING",
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 15,
  });
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const [project, activities] = await Promise.all([
    getProject(id),
    getProjectActivity(id),
  ]);

  if (!project) {
    notFound();
  }

  const status = statusConfig[project.status] || statusConfig.LEAD;
  
  // Calculate financials
  const totalBudget = project.budget || 0;
  const invoicedAmount = project.financialEntries
    .filter(e => e.type === "INVOICE_SENT" || e.type === "INVOICE_PAID")
    .reduce((sum, e) => sum + e.amount, 0);
  const paidAmount = project.financialEntries
    .filter(e => e.type === "INVOICE_PAID")
    .reduce((sum, e) => sum + e.amount, 0);
  const costs = project.financialEntries
    .filter(e => e.type === "COST")
    .reduce((sum, e) => sum + e.amount, 0);

  const completedTasks = project.tasks.filter(t => t.status === "COMPLETE").length;
  const totalTasks = project._count.tasks;

  return (
    <>
      <Header 
        title={project.name} 
        subtitle={project.client?.name || "No client assigned"}
      />
      
      <div className="p-6 space-y-6">
        {/* Back link and status */}
        <div className="flex items-center justify-between">
          <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700">
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
          <span className={cn("px-3 py-1 rounded-full text-sm font-medium", status.color)}>
            {status.label}
          </span>
        </div>

        {/* Main Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Details */}
          <Card className="lg:col-span-2 border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.description && (
                <div>
                  <p className="text-sm text-stone-500 mb-1">Description</p>
                  <p className="text-sm text-stone-700">{project.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                {project.location && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-stone-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-stone-500">Location</p>
                      <p className="text-sm font-medium">{project.location}</p>
                    </div>
                  </div>
                )}
                
                {project.client && (
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-stone-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-stone-500">Client</p>
                      <Link href={`/clients/${project.client.id}`} className="text-sm font-medium text-amber-600 hover:underline">
                        {project.client.name}
                      </Link>
                    </div>
                  </div>
                )}
                
                {project.startDate && (
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-stone-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-stone-500">Start Date</p>
                      <p className="text-sm font-medium">{formatDate(project.startDate)}</p>
                    </div>
                  </div>
                )}
                
                {project.endDate && (
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-stone-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-stone-500">End Date</p>
                      <p className="text-sm font-medium">{formatDate(project.endDate)}</p>
                    </div>
                  </div>
                )}
                
                {project.estimatedHours && (
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-stone-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-stone-500">Estimated Hours</p>
                      <p className="text-sm font-medium">{project.estimatedHours}h</p>
                    </div>
                  </div>
                )}
                
                {project.actualHours > 0 && (
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-stone-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-stone-500">Actual Hours</p>
                      <p className="text-sm font-medium">{project.actualHours}h</p>
                    </div>
                  </div>
                )}
              </div>

              {project.driveFolder && (
                <a
                  href={project.driveFolder}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Google Drive Folder
                </a>
              )}
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-stone-400" />
                Financials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-500">Budget</span>
                  <span className="text-sm font-semibold">{formatCurrency(totalBudget)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-500">Invoiced</span>
                  <span className="text-sm font-medium text-blue-600">{formatCurrency(invoicedAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-500">Paid</span>
                  <span className="text-sm font-medium text-emerald-600">{formatCurrency(paidAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-500">Costs</span>
                  <span className="text-sm font-medium text-red-600">-{formatCurrency(costs)}</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Margin</span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(paidAmount - costs)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Tracking */}
          <TimeLogger 
            projectId={project.id}
            projectName={project.name}
            estimatedHours={project.estimatedHours}
            actualHours={project.actualHours}
          />
        </div>

        {/* Tasks and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tasks */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-stone-400" />
                Tasks ({completedTasks}/{totalTasks})
              </CardTitle>
              <Link href={`/tasks?project=${project.id}`}>
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {project.tasks.length === 0 ? (
                <p className="text-sm text-stone-500 text-center py-4">No tasks yet</p>
              ) : (
                <div className="space-y-2">
                  {project.tasks.slice(0, 5).map((task) => (
                    <Link
                      key={task.id}
                      href={`/tasks/${task.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 transition-colors"
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
              )}
            </CardContent>
          </Card>

          {/* Meetings */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-stone-400" />
                Meetings ({project._count.meetings})
              </CardTitle>
              <Link href="/meetings/new">
                <Button variant="ghost" size="sm">Add Meeting</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {project.meetings.length === 0 ? (
                <p className="text-sm text-stone-500 text-center py-4">No meetings yet</p>
              ) : (
                <div className="space-y-2">
                  {project.meetings.map((meeting) => (
                    <Link
                      key={meeting.id}
                      href={`/meetings/${meeting.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-xs font-medium text-stone-600">
                        {new Date(meeting.date).getDate()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{meeting.title}</p>
                        <p className="text-xs text-stone-500">{meeting.type}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline */}
        <ActivityTimeline 
          activities={activities} 
          title="Project Activity"
          maxItems={10}
        />
      </div>
    </>
  );
}

