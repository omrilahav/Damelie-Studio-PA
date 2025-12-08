import { Header } from "@/components/layout/header";
import { MeetingsList } from "@/components/meetings/meetings-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import Link from "next/link";

async function getMeetings() {
  return db.meeting.findMany({
    include: {
      project: {
        include: { client: true },
      },
      _count: {
        select: { extractedTasks: true },
      },
    },
    orderBy: { date: "desc" },
  });
}

export default async function MeetingsPage() {
  const meetings = await getMeetings();

  return (
    <>
      <Header 
        title="Meetings & Site Visits" 
        subtitle={`${meetings.length} recorded`}
      />
      
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-end">
          <Link href="/meetings/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Meeting
            </Button>
          </Link>
        </div>

        <MeetingsList meetings={meetings} />
      </div>
    </>
  );
}

