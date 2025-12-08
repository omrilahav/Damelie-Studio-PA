import { Header } from "@/components/layout/header";
import { MeetingForm } from "@/components/meetings/meeting-form";
import { db } from "@/lib/db";

async function getProjects() {
  return db.project.findMany({
    where: { status: { in: ["ACTIVE", "NEGOTIATION"] } },
    orderBy: { name: "asc" },
  });
}

export default async function NewMeetingPage() {
  const projects = await getProjects();

  return (
    <>
      <Header 
        title="Record Meeting" 
        subtitle="Capture meeting notes and extract tasks with AI"
      />
      
      <div className="p-6 max-w-3xl">
        <MeetingForm projects={projects} />
      </div>
    </>
  );
}

