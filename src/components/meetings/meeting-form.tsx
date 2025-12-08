"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Loader2, 
  Save, 
  Sparkles, 
  CheckSquare, 
  AlertCircle,
  FileText 
} from "lucide-react";
import { cn, MEETING_TYPES } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
}

interface MeetingFormProps {
  projects: Project[];
}

interface ExtractedData {
  summary: string;
  decisions: string[];
  tasks: Array<{
    title: string;
    priority: string;
    dueDate: string | null;
    notes: string;
  }>;
  followUps: string[];
}

export function MeetingForm({ projects }: MeetingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [rawNotes, setRawNotes] = useState("");
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [projectId, setProjectId] = useState("");

  const handleProcessNotes = async () => {
    if (!rawNotes.trim() || !projectId) {
      toast.error("Please select a project and enter meeting notes");
      return;
    }

    setProcessing(true);
    
    try {
      const project = projects.find(p => p.id === projectId);
      
      const response = await fetch("/api/ai/meeting-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawNotes,
          projectName: project?.name || "Unknown Project",
        }),
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      setExtractedData(data);
      toast.success("Notes processed successfully!");
    } catch {
      toast.error("Failed to process notes. Please check your API key.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      date: formData.get("date") as string,
      type: formData.get("type") as string,
      projectId,
      rawNotes,
      summary: extractedData?.summary || null,
      decisions: extractedData?.decisions || [],
      tasks: extractedData?.tasks || [],
    };

    try {
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error();

      const result = await response.json();
      toast.success("Meeting saved!");
      router.push(`/meetings/${result.id}`);
      router.refresh();
    } catch {
      toast.error("Failed to save meeting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Meeting Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Site Visit - Kitchen Discussion"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date & Time *</Label>
              <Input
                id="date"
                name="date"
                type="datetime-local"
                defaultValue={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select name="type" defaultValue="MEETING">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MEETING_TYPES).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project *</Label>
              <Select value={projectId} onValueChange={setProjectId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Input */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Meeting Notes</span>
            <Button
              type="button"
              onClick={handleProcessNotes}
              disabled={processing || !rawNotes.trim() || !projectId}
              className="gap-2"
              variant="secondary"
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Process with AI
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={rawNotes}
            onChange={(e) => setRawNotes(e.target.value)}
            placeholder="Paste your meeting notes here...

Example:
- Discussed kitchen layout with client
- Decision: Going with marble countertops
- Need to get quote from supplier by Friday
- Client wants to see tile samples
- Follow up with architect about ceiling height"
            rows={10}
            className="font-mono text-sm"
          />
        </CardContent>
      </Card>

      {/* Extracted Data */}
      {extractedData && (
        <Card className="border-0 shadow-sm border-l-4 border-l-emerald-500">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              AI Extracted Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div>
              <Label className="text-xs uppercase tracking-wide text-stone-500">
                Summary
              </Label>
              <p className="mt-1 text-stone-700">{extractedData.summary}</p>
            </div>

            {/* Decisions */}
            {extractedData.decisions.length > 0 && (
              <div>
                <Label className="text-xs uppercase tracking-wide text-stone-500">
                  Decisions Made
                </Label>
                <ul className="mt-2 space-y-2">
                  {extractedData.decisions.map((decision, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      {decision}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tasks */}
            {extractedData.tasks.length > 0 && (
              <div>
                <Label className="text-xs uppercase tracking-wide text-stone-500">
                  Extracted Tasks ({extractedData.tasks.length})
                </Label>
                <div className="mt-2 space-y-2">
                  {extractedData.tasks.map((task, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg bg-stone-50"
                    >
                      <CheckSquare className="w-4 h-4 text-stone-400" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{task.title}</p>
                        {task.notes && (
                          <p className="text-xs text-stone-500">{task.notes}</p>
                        )}
                      </div>
                      <Badge variant="secondary">{task.priority}</Badge>
                      {task.dueDate && (
                        <span className="text-xs text-stone-500">{task.dueDate}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-ups */}
            {extractedData.followUps.length > 0 && (
              <div>
                <Label className="text-xs uppercase tracking-wide text-stone-500">
                  Follow-ups Required
                </Label>
                <ul className="mt-2 space-y-1">
                  {extractedData.followUps.map((item, i) => (
                    <li key={i} className="text-sm text-stone-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !projectId} className="gap-2">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Meeting
        </Button>
      </div>
    </form>
  );
}

