"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Clock, Plus, Loader2, Timer, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeLoggerProps {
  projectId: string;
  projectName: string;
  estimatedHours?: number | null;
  actualHours: number;
}

export function TimeLogger({ 
  projectId, 
  projectName, 
  estimatedHours, 
  actualHours 
}: TimeLoggerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");

  const progress = estimatedHours 
    ? Math.min(100, Math.round((actualHours / estimatedHours) * 100))
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hoursValue = parseFloat(hours);
    if (isNaN(hoursValue) || hoursValue <= 0) {
      toast.error("Please enter valid hours");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/time`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hours: hoursValue,
          description: description || `Time logged for ${projectName}`,
        }),
      });

      if (!response.ok) throw new Error();

      toast.success(`${hoursValue} hours logged`);
      setOpen(false);
      setHours("");
      setDescription("");
      window.location.reload();
    } catch {
      toast.error("Failed to log time");
    } finally {
      setLoading(false);
    }
  };

  const quickLogHours = async (hoursToLog: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/time`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hours: hoursToLog,
          description: `Quick log: ${hoursToLog} hours`,
        }),
      });

      if (!response.ok) throw new Error();

      toast.success(`${hoursToLog} hours logged`);
      window.location.reload();
    } catch {
      toast.error("Failed to log time");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-stone-400" />
            Time Tracking
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Log Time
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Time</DialogTitle>
                <DialogDescription>
                  Record time spent on {projectName}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="hours">Hours *</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.25"
                    min="0.25"
                    placeholder="e.g., 2.5"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What did you work on? (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="gap-2">
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Timer className="w-4 h-4" />
                    )}
                    Log Time
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-stone-500">Progress</span>
            <span className="font-semibold">
              {actualHours}h / {estimatedHours || "—"}h
            </span>
          </div>
          {estimatedHours && (
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all",
                  progress >= 100 ? "bg-red-500" :
                  progress >= 80 ? "bg-amber-500" : "bg-emerald-500"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          {estimatedHours && progress >= 80 && (
            <p className={cn(
              "text-xs mt-2 flex items-center gap-1",
              progress >= 100 ? "text-red-600" : "text-amber-600"
            )}>
              <TrendingUp className="w-3 h-3" />
              {progress >= 100 
                ? "Budget exceeded by " + (actualHours - estimatedHours).toFixed(1) + "h"
                : "Approaching budget limit"
              }
            </p>
          )}
        </div>

        {/* Quick Log Buttons */}
        <div>
          <p className="text-xs text-stone-500 mb-2">Quick log:</p>
          <div className="flex gap-2">
            {[0.5, 1, 2, 4].map((h) => (
              <Button
                key={h}
                size="sm"
                variant="outline"
                onClick={() => quickLogHours(h)}
                disabled={loading}
                className="flex-1"
              >
                {h}h
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
