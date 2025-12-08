"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Save, Building2 } from "lucide-react";
import { PROJECT_STATUSES } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
  clientId: string | null;
  description: string | null;
  location: string | null;
  budget: number | null;
  estimatedHours: number | null;
  driveFolder: string | null;
  startDate: Date | null;
  endDate: Date | null;
}

interface ProjectFormProps {
  clients: Client[];
  project?: Project;
}

export function ProjectForm({ clients, project }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditing = !!project;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const clientIdValue = formData.get("clientId") as string;
    const data = {
      name: formData.get("name") as string,
      status: formData.get("status") as string,
      clientId: clientIdValue && clientIdValue !== "none" ? clientIdValue : null,
      description: formData.get("description") as string || null,
      location: formData.get("location") as string || null,
      budget: formData.get("budget") ? parseFloat(formData.get("budget") as string) : null,
      estimatedHours: formData.get("estimatedHours") ? parseFloat(formData.get("estimatedHours") as string) : null,
      driveFolder: formData.get("driveFolder") as string || null,
      startDate: formData.get("startDate") ? new Date(formData.get("startDate") as string) : null,
      endDate: formData.get("endDate") ? new Date(formData.get("endDate") as string) : null,
    };

    try {
      const url = isEditing ? `/api/projects/${project.id}` : "/api/projects";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save project");
      }

      const result = await response.json();
      toast.success(isEditing ? "Project updated" : "Project created");
      router.push(`/projects/${result.id}`);
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={project?.name}
              placeholder="e.g., Villa Renovation Son Vida"
              required
            />
          </div>

          {/* Status & Client */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={project?.status || "LEAD"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROJECT_STATUSES).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientId">Client</Label>
              <Select name="clientId" defaultValue={project?.clientId || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              defaultValue={project?.location || ""}
              placeholder="e.g., Son Vida, Mallorca"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={project?.description || ""}
              placeholder="Brief description of the project scope..."
              rows={3}
            />
          </div>

          {/* Budget & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (EUR)</Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                step="0.01"
                defaultValue={project?.budget || ""}
                placeholder="e.g., 150000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                name="estimatedHours"
                type="number"
                step="0.5"
                defaultValue={project?.estimatedHours || ""}
                placeholder="e.g., 200"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={project?.startDate ? new Date(project.startDate).toISOString().split("T")[0] : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={project?.endDate ? new Date(project.endDate).toISOString().split("T")[0] : ""}
              />
            </div>
          </div>

          {/* Google Drive */}
          <div className="space-y-2">
            <Label htmlFor="driveFolder">Google Drive Folder URL</Label>
            <Input
              id="driveFolder"
              name="driveFolder"
              type="url"
              defaultValue={project?.driveFolder || ""}
              placeholder="https://drive.google.com/drive/folders/..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEditing ? "Save Changes" : "Create Project"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

