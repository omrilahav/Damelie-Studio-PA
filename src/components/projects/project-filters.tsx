"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FolderKanban, Sparkles, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ProjectFiltersProps {
  stats: {
    total: number;
    active: number;
    negotiation: number;
    leads: number;
  };
}

const filters = [
  { value: "all", label: "All", icon: FolderKanban },
  { value: "ACTIVE", label: "Active", icon: Sparkles },
  { value: "NEGOTIATION", label: "Negotiation", icon: Clock },
  { value: "LEAD", label: "Leads", icon: Users },
];

export function ProjectFilters({ stats }: ProjectFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") || "all";
  const currentSearch = searchParams.get("search") || "";

  const getCount = (filter: string) => {
    switch (filter) {
      case "all": return stats.total;
      case "ACTIVE": return stats.active;
      case "NEGOTIATION": return stats.negotiation;
      case "LEAD": return stats.leads;
      default: return 0;
    }
  };

  const handleFilterChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    router.push(`/projects?${params.toString()}`);
  };

  const handleSearchChange = (search: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    router.push(`/projects?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map((filter) => (
          <Button
            key={filter.value}
            variant={currentStatus === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange(filter.value)}
            className="gap-2"
          >
            <filter.icon className="w-4 h-4" />
            {filter.label}
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded-full",
              currentStatus === filter.value 
                ? "bg-white/20" 
                : "bg-stone-100"
            )}>
              {getCount(filter.value)}
            </span>
          </Button>
        ))}
      </div>

      {/* Search & Add */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-initial">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Search projects..."
            defaultValue={currentSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 w-full sm:w-64"
          />
        </div>
        <Link href="/projects/new">
          <Button className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </Link>
      </div>
    </div>
  );
}

