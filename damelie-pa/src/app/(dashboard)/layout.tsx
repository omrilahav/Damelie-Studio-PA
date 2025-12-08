import { Sidebar } from "@/components/layout/sidebar";
import { db } from "@/lib/db";

async function getSidebarData() {
  const [pendingReminders, overdueTasksCount] = await Promise.all([
    db.reminder.count({ where: { status: "DRAFT" } }),
    db.task.count({
      where: {
        status: { notIn: ["COMPLETE", "CANCELLED"] },
        dueDate: { lt: new Date() },
      },
    }),
  ]);

  return { pendingReminders, overdueTasksCount };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarData = await getSidebarData();

  return (
    <div className="min-h-screen bg-stone-50">
      <Sidebar 
        pendingReminders={sidebarData.pendingReminders}
        overdueTasksCount={sidebarData.overdueTasksCount}
      />
      <main className="pl-64">
        {children}
      </main>
    </div>
  );
}

