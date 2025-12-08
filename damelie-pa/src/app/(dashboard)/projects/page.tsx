import { Header } from "@/components/layout/header";
import { ProjectsList } from "@/components/projects/projects-list";
import { ProjectFilters } from "@/components/projects/project-filters";
import { db } from "@/lib/db";

interface ProjectsPageProps {
  searchParams: Promise<{ status?: string; search?: string }>;
}

async function getProjects(status?: string, search?: string) {
  const where: any = {};

  if (status && status !== "all") {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { location: { contains: search } },
      { client: { name: { contains: search } } },
    ];
  }

  return db.project.findMany({
    where,
    include: {
      client: true,
      _count: {
        select: {
          tasks: true,
          meetings: true,
        },
      },
    },
    orderBy: [
      { status: "asc" },
      { updatedAt: "desc" },
    ],
  });
}

async function getProjectStats() {
  const [total, active, negotiation, leads] = await Promise.all([
    db.project.count(),
    db.project.count({ where: { status: "ACTIVE" } }),
    db.project.count({ where: { status: "NEGOTIATION" } }),
    db.project.count({ where: { status: "LEAD" } }),
  ]);

  return { total, active, negotiation, leads };
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;
  const [projects, stats] = await Promise.all([
    getProjects(params.status, params.search),
    getProjectStats(),
  ]);

  return (
    <>
      <Header 
        title="Projects" 
        subtitle={`${stats.total} total projects`}
      />
      
      <div className="p-6 space-y-6">
        <ProjectFilters stats={stats} />
        <ProjectsList projects={projects} />
      </div>
    </>
  );
}

