import { Header } from "@/components/layout/header";
import { RemindersList } from "@/components/reminders/reminders-list";
import { db } from "@/lib/db";

async function getReminders() {
  return db.reminder.findMany({
    include: {
      task: {
        include: {
          project: {
            include: { client: true },
          },
        },
      },
    },
    orderBy: [
      { status: "asc" },
      { createdAt: "desc" },
    ],
  });
}

async function getReminderStats() {
  const [draft, approved, sent] = await Promise.all([
    db.reminder.count({ where: { status: "DRAFT" } }),
    db.reminder.count({ where: { status: "APPROVED" } }),
    db.reminder.count({ where: { status: "SENT" } }),
  ]);

  return { draft, approved, sent };
}

export default async function RemindersPage() {
  const [reminders, stats] = await Promise.all([
    getReminders(),
    getReminderStats(),
  ]);

  return (
    <>
      <Header 
        title="Reminders" 
        subtitle={`${stats.draft} pending approval`}
      />
      
      <div className="p-6">
        <RemindersList reminders={reminders} stats={stats} />
      </div>
    </>
  );
}

