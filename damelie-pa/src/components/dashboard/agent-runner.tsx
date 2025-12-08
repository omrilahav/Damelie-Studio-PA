"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Bot, 
  Bell, 
  FileSpreadsheet, 
  Calendar,
  Loader2,
  PlayCircle,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  endpoint: string;
  color: string;
}

const agents: AgentConfig[] = [
  {
    id: "overdue-reminders",
    name: "Overdue Reminder Generator",
    description: "Auto-generate reminder drafts for overdue tasks",
    icon: Bell,
    endpoint: "/api/agents/overdue-reminders",
    color: "text-amber-500",
  },
  {
    id: "meeting-prep",
    name: "Meeting Preparation",
    description: "Prepare briefings for upcoming meetings",
    icon: Calendar,
    endpoint: "/api/agents/meeting-prep",
    color: "text-blue-500",
  },
];

export function AgentRunner() {
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  const runAgent = async (agent: AgentConfig) => {
    setRunning(agent.id);
    
    try {
      const response = await fetch(agent.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Agent failed");
      }

      setResults(prev => ({ ...prev, [agent.id]: data }));
      
      if (data.remindersCreated > 0) {
        toast.success(`Created ${data.remindersCreated} reminder drafts`);
        window.location.reload();
      } else if (data.meetingsPrepped > 0) {
        toast.success(`Prepared ${data.meetingsPrepped} meeting briefings`);
      } else {
        toast.info(data.message || "Agent completed - no actions needed");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Agent failed");
    } finally {
      setRunning(null);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bot className="w-4 h-4 text-purple-500" />
          AI Agents
          <Badge variant="secondary" className="ml-auto">
            Beta
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {agents.map((agent) => {
            const isRunning = running === agent.id;
            const result = results[agent.id];

            return (
              <div
                key={agent.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors"
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm",
                )}>
                  <agent.icon className={cn("w-5 h-5", agent.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-stone-900">
                    {agent.name}
                  </p>
                  <p className="text-xs text-stone-500 truncate">
                    {agent.description}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={result ? "ghost" : "outline"}
                  onClick={() => runAgent(agent)}
                  disabled={isRunning}
                  className="gap-1.5"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Running...
                    </>
                  ) : result ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Done
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-3.5 h-3.5" />
                      Run
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-stone-400 mt-4 text-center">
          Agents analyze your data and take automated actions with AI
        </p>
      </CardContent>
    </Card>
  );
}
