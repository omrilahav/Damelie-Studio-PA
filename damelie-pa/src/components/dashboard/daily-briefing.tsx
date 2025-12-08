"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, RefreshCw, Sun, Moon, Sunrise, Calendar, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", icon: Sunrise };
  if (hour < 18) return { text: "Good afternoon", icon: Sun };
  return { text: "Good evening", icon: Moon };
}

export function DailyBriefing() {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [briefingType, setBriefingType] = useState<"daily" | "weekly">("daily");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const greeting = getGreeting();

  const generateBriefing = async (type: "daily" | "weekly" = briefingType) => {
    setLoading(true);
    setError(null);
    setBriefingType(type);
    
    try {
      const response = await fetch("/api/ai/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate briefing");
      }

      const data = await response.json();
      setBriefing(data.briefing);
    } catch (err) {
      setError("Unable to generate briefing. Please check your API key in settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      {/* Gradient Header */}
      <div className="bg-gradient-to-br from-stone-800 via-stone-900 to-stone-800 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
              <greeting.icon className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{greeting.text}</h2>
              <p className="text-sm text-stone-300">
                {new Date().toLocaleDateString("en-GB", { 
                  weekday: "long",
                  day: "numeric", 
                  month: "long" 
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Briefing Type Toggle */}
            <div className="flex items-center bg-white/10 rounded-lg p-1">
              <button
                onClick={() => !loading && generateBriefing("daily")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  briefingType === "daily" 
                    ? "bg-white/20 text-white" 
                    : "text-stone-300 hover:text-white"
                )}
              >
                <Calendar className="w-3.5 h-3.5" />
                Daily
              </button>
              <button
                onClick={() => !loading && generateBriefing("weekly")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  briefingType === "weekly" 
                    ? "bg-white/20 text-white" 
                    : "text-stone-300 hover:text-white"
                )}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                Weekly
              </button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => generateBriefing(briefingType)}
              disabled={loading}
              className="text-white hover:bg-white/10 gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-300" />
              )}
              {briefing ? "Refresh" : "Generate"}
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/4" />
            <div className="pt-4 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <p className="text-stone-600 mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={() => generateBriefing()}>
              Try Again
            </Button>
          </div>
        ) : briefing ? (
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
              <span className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-full",
                briefingType === "daily" 
                  ? "bg-blue-100 text-blue-700" 
                  : "bg-purple-100 text-purple-700"
              )}>
                {briefingType === "daily" ? "Daily Briefing" : "Weekly Summary"}
              </span>
              <span className="text-xs text-stone-400">
                Generated at {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div 
              className="prose-briefing"
              dangerouslySetInnerHTML={{ __html: formatBriefing(briefing) }}
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="font-semibold text-stone-900 mb-2">
              AI-Powered Briefings
            </h3>
            <p className="text-sm text-stone-500 max-w-sm mx-auto mb-4">
              Get a personalized summary of your day or week including urgent tasks, 
              upcoming meetings, financial health, and important deadlines.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => generateBriefing("daily")} className="gap-2">
                <Calendar className="w-4 h-4" />
                Daily Briefing
              </Button>
              <Button onClick={() => generateBriefing("weekly")} variant="outline" className="gap-2">
                <CalendarDays className="w-4 h-4" />
                Weekly Summary
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatBriefing(text: string): string {
  // Convert markdown-style formatting to HTML
  let formatted = text
    .replace(/## (.*?)$/gm, "<h2>$1</h2>")
    .replace(/### (.*?)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^- (.*?)$/gm, "<li>$1</li>");
  
  // Wrap consecutive list items in ul tags
  formatted = formatted.replace(/(<li>[\s\S]*?<\/li>)+/g, "<ul>$&</ul>");
  
  return formatted
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<)(.+)$/gm, "<p>$1</p>");
}

