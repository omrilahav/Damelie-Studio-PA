"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

interface MeetingPrepButtonProps {
  meetingId: string;
}

export function MeetingPrepButton({ meetingId }: MeetingPrepButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePrep = async () => {
    setLoading(true);
    
    try {
      const response = await fetch("/api/agents/meeting-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to prepare meeting");
      }

      toast.success("Meeting briefing prepared!");
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to prepare meeting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePrep} 
      disabled={loading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4 text-amber-500" />
      )}
      {loading ? "Preparing..." : "AI Prep"}
    </Button>
  );
}
