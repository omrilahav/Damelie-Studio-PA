import { Header } from "@/components/layout/header";
import { ProjectForm } from "@/components/projects/project-form";
import { db } from "@/lib/db";

async function getClients() {
  return db.client.findMany({
    orderBy: { name: "asc" },
  });
}

export default async function NewProjectPage() {
  const clients = await getClients();

  return (
    <>
      <Header 
        title="New Project" 
        subtitle="Create a new construction project"
      />
      
      <div className="p-6 max-w-2xl">
        <ProjectForm clients={clients} />
      </div>
    </>
  );
}

