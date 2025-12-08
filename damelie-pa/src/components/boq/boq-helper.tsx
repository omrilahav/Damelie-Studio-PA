"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Plus, 
  FileSpreadsheet, 
  Sparkles, 
  TrendingUp,
  Lightbulb,
  History,
  CheckCircle2
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface BoQHelperProps {
  projects: Array<{ id: string; name: string }>;
  categories: string[];
}

interface AISuggestion {
  suggestedPrice: {
    min: number;
    max: number;
    recommended: number;
    confidence: "high" | "medium" | "low";
    reasoning: string;
  } | null;
  similarItems: Array<{
    item: string;
    unitPrice: number;
    unit: string;
    date: string;
    relevance: "high" | "medium" | "low";
  }>;
  tips: string[];
}

const defaultCategories = [
  "Flooring",
  "Tiles",
  "Kitchen",
  "Bathroom",
  "Electrical",
  "Plumbing",
  "Painting",
  "Carpentry",
  "Windows & Doors",
  "HVAC",
  "Landscaping",
  "Other",
];

const confidenceColors = {
  high: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-stone-100 text-stone-700",
};

export function BoQHelper({ projects, categories }: BoQHelperProps) {
  const [loading, setLoading] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [projectId, setProjectId] = useState("none");
  const [itemDescription, setItemDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [suggestions, setSuggestions] = useState<AISuggestion | null>(null);

  const allCategories = [...new Set([...defaultCategories, ...categories])].sort();

  const getSuggestions = async () => {
    if (!itemDescription.trim()) {
      toast.error("Please enter an item description first");
      return;
    }

    setSuggestLoading(true);
    setSuggestions(null);

    try {
      const response = await fetch("/api/ai/boq-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: itemDescription,
          category: selectedCategory,
          unit: selectedUnit,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get suggestions");
      }

      const data = await response.json();
      setSuggestions(data);
      toast.success("AI suggestions generated!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to get suggestions");
    } finally {
      setSuggestLoading(false);
    }
  };

  const applyRecommendedPrice = () => {
    if (suggestions?.suggestedPrice) {
      const priceInput = document.getElementById("unitPrice") as HTMLInputElement;
      if (priceInput) {
        priceInput.value = suggestions.suggestedPrice.recommended.toString();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      category: formData.get("category") as string,
      item: formData.get("item") as string,
      unit: formData.get("unit") as string,
      quantity: parseFloat(formData.get("quantity") as string) || null,
      unitPrice: parseFloat(formData.get("unitPrice") as string),
      source: formData.get("source") as string || null,
      notes: formData.get("notes") as string || null,
      projectId: projectId === "none" ? null : projectId,
    };

    try {
      const response = await fetch("/api/boq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error();

      toast.success("BoQ item added");
      setItemDescription("");
      setSelectedCategory("");
      setSelectedUnit("");
      setSuggestions(null);
      (e.target as HTMLFormElement).reset();
      window.location.reload();
    } catch {
      toast.error("Failed to add BoQ item");
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setItemDescription(e.target.value);
    // Clear suggestions when item changes significantly
    if (suggestions && e.target.value.length < 5) {
      setSuggestions(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-stone-400" />
            Add BoQ Item
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  name="category" 
                  required
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="item">Item Description *</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={getSuggestions}
                    disabled={suggestLoading || !itemDescription.trim()}
                    className="h-6 text-xs gap-1 text-amber-600 hover:text-amber-700"
                  >
                    {suggestLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    Get AI Price Suggestion
                  </Button>
                </div>
                <Input
                  id="item"
                  name="item"
                  placeholder="e.g., Marble floor tiles 60x60cm Calacatta"
                  value={itemDescription}
                  onChange={handleItemChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select 
                  name="unit" 
                  required
                  value={selectedUnit}
                  onValueChange={setSelectedUnit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="m²">m² (square meter)</SelectItem>
                    <SelectItem value="m">m (linear meter)</SelectItem>
                    <SelectItem value="unit">unit</SelectItem>
                    <SelectItem value="set">set</SelectItem>
                    <SelectItem value="hour">hour</SelectItem>
                    <SelectItem value="day">day</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="liter">liter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  step="0.01"
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price (EUR) *</Label>
                <Input
                  id="unitPrice"
                  name="unitPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectId">Project</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Price Source</Label>
              <Input
                id="source"
                name="source"
                placeholder="e.g., Supplier quote, Previous project, Estimate"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add Item
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* AI Suggestions Panel */}
      {suggestions && (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-l-amber-400">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              AI Price Suggestions
              {suggestions.suggestedPrice && (
                <Badge className={confidenceColors[suggestions.suggestedPrice.confidence]}>
                  {suggestions.suggestedPrice.confidence} confidence
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestions.suggestedPrice && (
              <div className="p-4 bg-white rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-stone-500">Recommended Price</p>
                    <p className="text-2xl font-bold text-stone-900">
                      {formatCurrency(suggestions.suggestedPrice.recommended)}
                    </p>
                    <p className="text-xs text-stone-400">
                      Range: {formatCurrency(suggestions.suggestedPrice.min)} - {formatCurrency(suggestions.suggestedPrice.max)}
                    </p>
                  </div>
                  <Button size="sm" onClick={applyRecommendedPrice} className="gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Apply
                  </Button>
                </div>
                <p className="text-sm text-stone-600">{suggestions.suggestedPrice.reasoning}</p>
              </div>
            )}

            {suggestions.similarItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <History className="w-4 h-4 text-stone-400" />
                  <p className="text-sm font-medium text-stone-700">Similar Items from History</p>
                </div>
                <div className="space-y-2">
                  {suggestions.similarItems.slice(0, 3).map((item, i) => (
                    <div
                      key={i}
                      className={cn(
                        "p-3 rounded-lg bg-white",
                        item.relevance === "high" && "ring-1 ring-emerald-200"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-stone-900">{item.item}</p>
                          <p className="text-xs text-stone-500">{item.date} · {item.unit}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{formatCurrency(item.unitPrice)}</p>
                          <Badge variant="secondary" className="text-xs">
                            {item.relevance}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {suggestions.tips.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Tips</p>
                    <ul className="text-xs text-blue-700 mt-1 space-y-1">
                      {suggestions.tips.map((tip, i) => (
                        <li key={i}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

