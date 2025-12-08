import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Users, 
  MapPin, 
  Phone,
  Clock,
  CheckSquare,
  FileText,
  ChevronRight 
} from "lucide-react";
import { cn, formatDate, formatDateTime, MEETING_TYPES } from "@/lib/utils";
import Link from "next/link";

interface Meeting {
  id: string;
  title: string;
  date: Date;
  type: string;
  summary: string | null;
  confirmed: boolean;
  project: {
    id: string;
    name: string;
    client: { name: string } | null;
  };
  _count: {
    extractedTasks: number;
  };
}

interface MeetingsListProps {
  meetings: Meeting[];
}

const typeIcons = {
  MEETING: Users,
  SITE_VISIT: MapPin,
  CALL: Phone,
};

const typeColors = {
  MEETING: "bg-blue-50 text-blue-700 border-blue-200",
  SITE_VISIT: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CALL: "bg-purple-50 text-purple-700 border-purple-200",
};

export function MeetingsList({ meetings }: MeetingsListProps) {
  if (meetings.length === 0) {
    return (
      <Card className="border-0 shadow-sm p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-stone-400" />
        </div>
        <h3 className="font-semibold text-stone-900 mb-2">No meetings recorded</h3>
        <p className="text-sm text-stone-500 mb-4">
          Record your first meeting to start tracking discussions and tasks
        </p>
        <Link
          href="/meetings/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
        >
          Record Meeting
        </Link>
      </Card>
    );
  }

  // Group by date
  const groupedMeetings = meetings.reduce((acc, meeting) => {
    const dateKey = formatDate(meeting.date);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(meeting);
    return acc;
  }, {} as Record<string, Meeting[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedMeetings).map(([date, dateMeetings]) => (
        <div key={date}>
          <h3 className="text-sm font-medium text-stone-500 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {date}
          </h3>
          <div className="space-y-3">
            {dateMeetings.map((meeting, index) => {
              const Icon = typeIcons[meeting.type as keyof typeof typeIcons] || Users;
              const colorClass = typeColors[meeting.type as keyof typeof typeColors] || typeColors.MEETING;
              const time = new Date(meeting.date).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <Link
                  key={meeting.id}
                  href={`/meetings/${meeting.id}`}
                  className={cn(
                    "group block animate-fade-in"
                  )}
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <Card className="border-0 shadow-sm p-4 hover:shadow-md transition-all card-hover">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
                        colorClass
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">
                              {meeting.title}
                            </h3>
                            <p className="text-sm text-stone-500">
                              {meeting.project.name}
                              {meeting.project.client && ` · ${meeting.project.client.name}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-sm font-medium text-stone-600">
                              {time}
                            </span>
                            <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-stone-500" />
                          </div>
                        </div>

                        {/* Summary Preview */}
                        {meeting.summary && (
                          <p className="text-sm text-stone-500 mt-2 line-clamp-2">
                            {meeting.summary}
                          </p>
                        )}

                        {/* Meta */}
                        <div className="flex items-center gap-3 mt-3">
                          <Badge variant="secondary" className={colorClass}>
                            {meeting.type.replace("_", " ")}
                          </Badge>
                          {meeting._count.extractedTasks > 0 && (
                            <Badge variant="secondary" className="gap-1">
                              <CheckSquare className="w-3 h-3" />
                              {meeting._count.extractedTasks} tasks
                            </Badge>
                          )}
                          {!meeting.confirmed && (
                            <Badge variant="warning">
                              Needs Review
                            </Badge>
                          )}
                          {meeting.summary && (
                            <Badge variant="info" className="gap-1">
                              <FileText className="w-3 h-3" />
                              Summarized
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

