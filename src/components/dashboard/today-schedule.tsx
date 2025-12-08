import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Video, Users, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Meeting {
  id: string;
  title: string;
  date: Date;
  type: string;
  project: {
    id: string;
    name: string;
  };
}

interface TodayScheduleProps {
  meetings: Meeting[];
}

const typeIcons = {
  MEETING: Users,
  SITE_VISIT: MapPin,
  CALL: Phone,
};

const typeColors = {
  MEETING: "bg-blue-50 text-blue-700",
  SITE_VISIT: "bg-emerald-50 text-emerald-700",
  CALL: "bg-purple-50 text-purple-700",
};

export function TodaySchedule({ meetings }: TodayScheduleProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-stone-400" />
            Today&apos;s Schedule
          </CardTitle>
          <Link 
            href="/meetings" 
            className="text-xs text-stone-500 hover:text-stone-700"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {meetings.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-stone-300" />
            </div>
            <p className="text-sm text-stone-500">No meetings today</p>
            <p className="text-xs text-stone-400 mt-1">Enjoy your focus time!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map((meeting, index) => {
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
                    "block p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors animate-fade-in"
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      colorClass.split(" ")[0]
                    )}>
                      <Icon className={cn("w-5 h-5", colorClass.split(" ")[1])} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-stone-900 truncate">
                        {meeting.title}
                      </p>
                      <p className="text-xs text-stone-500 truncate">
                        {meeting.project.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center gap-1 text-xs text-stone-400">
                          <Clock className="w-3 h-3" />
                          {time}
                        </div>
                        <Badge variant="secondary" className="text-[10px] h-5">
                          {meeting.type.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

