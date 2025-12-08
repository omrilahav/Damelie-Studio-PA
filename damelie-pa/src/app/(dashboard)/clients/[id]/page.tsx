import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building2, 
  Globe,
  MapPin,
  FolderOpen
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

interface ClientPageProps {
  params: Promise<{ id: string }>;
}

async function getClient(id: string) {
  return db.client.findUnique({
    where: { id },
    include: {
      projects: {
        orderBy: { updatedAt: "desc" },
        include: {
          _count: {
            select: { tasks: true },
          },
        },
      },
      _count: {
        select: {
          projects: true,
        },
      },
    },
  });
}

const statusConfig: Record<string, { label: string; color: string }> = {
  LEAD: { label: "Lead", color: "bg-blue-100 text-blue-700" },
  NEGOTIATION: { label: "Negotiation", color: "bg-amber-100 text-amber-700" },
  ACTIVE: { label: "Active", color: "bg-emerald-100 text-emerald-700" },
  ON_HOLD: { label: "On Hold", color: "bg-stone-100 text-stone-700" },
  CLOSED_WON: { label: "Completed", color: "bg-green-100 text-green-700" },
  CLOSED_LOST: { label: "Lost", color: "bg-red-100 text-red-700" },
};

export default async function ClientPage({ params }: ClientPageProps) {
  const { id } = await params;
  const client = await getClient(id);

  if (!client) {
    notFound();
  }

  const activeProjects = client.projects.filter(p => p.status === "ACTIVE").length;
  const totalBudget = client.projects.reduce((sum, p) => sum + (p.budget || 0), 0);

  return (
    <>
      <Header 
        title={client.name} 
        subtitle={client.company || "Client"}
      />
      
      <div className="p-6 space-y-6">
        {/* Back link */}
        <div className="flex items-center justify-between">
          <Link href="/clients" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700">
            <ArrowLeft className="w-4 h-4" />
            Back to Clients
          </Link>
        </div>

        {/* Main Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Details */}
          <Card className="lg:col-span-2 border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {client.email && (
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-stone-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-stone-500">Email</p>
                      <a href={`mailto:${client.email}`} className="text-sm font-medium text-amber-600 hover:underline">
                        {client.email}
                      </a>
                    </div>
                  </div>
                )}
                
                {client.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-stone-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-stone-500">Phone</p>
                      <a href={`tel:${client.phone}`} className="text-sm font-medium text-amber-600 hover:underline">
                        {client.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {client.company && (
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-stone-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-stone-500">Company</p>
                      <p className="text-sm font-medium">{client.company}</p>
                    </div>
                  </div>
                )}
                
                {client.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-stone-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-stone-500">Address</p>
                      <p className="text-sm font-medium">{client.address}</p>
                    </div>
                  </div>
                )}
                
              </div>

              {client.notes && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-stone-500 mb-1">Notes</p>
                  <p className="text-sm text-stone-700 whitespace-pre-wrap">{client.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-stone-400" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-500">Total Projects</span>
                  <span className="text-sm font-semibold">{client._count.projects}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-500">Active Projects</span>
                  <span className="text-sm font-medium text-emerald-600">{activeProjects}</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-stone-500">Total Budget</span>
                    <span className="text-sm font-semibold">{formatCurrency(totalBudget)}</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-3 text-xs text-stone-400">
                <p>Client since {formatDate(client.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Projects</CardTitle>
            <Link href="/projects/new">
              <Button variant="ghost" size="sm">Add Project</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {client.projects.length === 0 ? (
              <p className="text-sm text-stone-500 text-center py-8">No projects yet</p>
            ) : (
              <div className="space-y-2">
                {client.projects.map((project) => {
                  const status = statusConfig[project.status] || statusConfig.LEAD;
                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{project.name}</p>
                        {project.location && (
                          <p className="text-xs text-stone-500">{project.location}</p>
                        )}
                      </div>
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", status.color)}>
                        {status.label}
                      </span>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(project.budget || 0)}</p>
                        <p className="text-xs text-stone-400">{project._count.tasks} tasks</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

