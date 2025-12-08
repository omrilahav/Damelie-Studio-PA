"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Save, User, DollarSign, Clock, Sparkles, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

interface Settings {
  id: string;
  userName: string;
  defaultCurrency: string;
  workingHoursPerDay: number;
  weeklyCapacityHours: number;
  marginWarningThreshold: number;
  aiProvider: string;
  hasAnthropicKey: boolean;
  hasOpenaiKey: boolean;
}

interface SettingsFormProps {
  settings: Settings;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [anthropicKey, setAnthropicKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [currency, setCurrency] = useState(settings.defaultCurrency);
  const [aiProvider, setAiProvider] = useState(settings.aiProvider);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {
      userName: formData.get("userName") as string,
      defaultCurrency: currency,
      workingHoursPerDay: parseFloat(formData.get("workingHoursPerDay") as string),
      weeklyCapacityHours: parseFloat(formData.get("weeklyCapacityHours") as string),
      marginWarningThreshold: parseFloat(formData.get("marginWarningThreshold") as string),
      aiProvider: aiProvider,
    };

    // Get API keys from form data (fallback if React state wasn't updated)
    const anthropicKeyValue = anthropicKey || (formData.get("anthropicApiKey") as string);
    const openaiKeyValue = openaiKey || (formData.get("openaiApiKey") as string);
    
    // Only include API keys if they were changed (not empty)
    if (anthropicKeyValue) {
      data.anthropicApiKey = anthropicKeyValue;
    }
    if (openaiKeyValue) {
      data.openaiApiKey = openaiKeyValue;
    }

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error();

      toast.success("Settings saved");
      // Clear the key inputs after save
      setAnthropicKey("");
      setOpenaiKey("");
      // Refresh to show updated status
      window.location.reload();
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveKey = async (provider: "anthropic" | "openai") => {
    if (!confirm(`Are you sure you want to remove the ${provider === "anthropic" ? "Anthropic" : "OpenAI"} API key?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [`${provider}ApiKey`]: null,
        }),
      });

      if (!response.ok) throw new Error();

      toast.success("API key removed");
      window.location.reload();
    } catch {
      toast.error("Failed to remove API key");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-stone-400" />
            Profile
          </CardTitle>
          <CardDescription>Your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userName">Display Name</Label>
            <Input
              id="userName"
              name="userName"
              defaultValue={settings.userName}
              placeholder="Your name"
            />
          </div>
        </CardContent>
      </Card>

      {/* Financial Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-stone-400" />
            Financial Settings
          </CardTitle>
          <CardDescription>Currency and margin warnings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultCurrency">Default Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marginWarningThreshold">Margin Warning (%)</Label>
              <Input
                id="marginWarningThreshold"
                name="marginWarningThreshold"
                type="number"
                step="1"
                min="0"
                max="100"
                defaultValue={settings.marginWarningThreshold}
              />
              <p className="text-xs text-stone-400">
                Warn when project margin falls below this threshold
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capacity */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-stone-400" />
            Capacity Settings
          </CardTitle>
          <CardDescription>Your working hours for workload calculations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workingHoursPerDay">Hours per Day</Label>
              <Input
                id="workingHoursPerDay"
                name="workingHoursPerDay"
                type="number"
                step="0.5"
                min="1"
                max="24"
                defaultValue={settings.workingHoursPerDay}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weeklyCapacityHours">Weekly Capacity (hours)</Label>
              <Input
                id="weeklyCapacityHours"
                name="weeklyCapacityHours"
                type="number"
                step="1"
                min="1"
                max="168"
                defaultValue={settings.weeklyCapacityHours}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            AI Settings
          </CardTitle>
          <CardDescription>Configure AI-powered features for briefings, summaries, and more</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="aiProvider">AI Provider</Label>
            <Select value={aiProvider} onValueChange={setAiProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Anthropic API Key */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="anthropicApiKey" className="flex items-center gap-2">
                Anthropic API Key
                {settings.hasAnthropicKey ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-normal">
                    <CheckCircle2 className="w-3 h-3" />
                    Configured
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-stone-400 font-normal">
                    <XCircle className="w-3 h-3" />
                    Not set
                  </span>
                )}
              </Label>
              {settings.hasAnthropicKey && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 text-xs"
                  onClick={() => handleRemoveKey("anthropic")}
                >
                  Remove
                </Button>
              )}
            </div>
            <div className="relative">
              <Input
                id="anthropicApiKey"
                name="anthropicApiKey"
                type={showAnthropicKey ? "text" : "password"}
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder={settings.hasAnthropicKey ? "••••••••••••••••••••" : "sk-ant-api03-..."}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowAnthropicKey(!showAnthropicKey)}
              >
                {showAnthropicKey ? (
                  <EyeOff className="w-4 h-4 text-stone-400" />
                ) : (
                  <Eye className="w-4 h-4 text-stone-400" />
                )}
              </Button>
            </div>
            <p className="text-xs text-stone-400">
              Get your API key from{" "}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 hover:underline"
              >
                console.anthropic.com
              </a>
            </p>
          </div>

          {/* OpenAI API Key */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="openaiApiKey" className="flex items-center gap-2">
                OpenAI API Key
                {settings.hasOpenaiKey ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-normal">
                    <CheckCircle2 className="w-3 h-3" />
                    Configured
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-stone-400 font-normal">
                    <XCircle className="w-3 h-3" />
                    Not set
                  </span>
                )}
              </Label>
              {settings.hasOpenaiKey && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 text-xs"
                  onClick={() => handleRemoveKey("openai")}
                >
                  Remove
                </Button>
              )}
            </div>
            <div className="relative">
              <Input
                id="openaiApiKey"
                name="openaiApiKey"
                type={showOpenaiKey ? "text" : "password"}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder={settings.hasOpenaiKey ? "••••••••••••••••••••" : "sk-..."}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowOpenaiKey(!showOpenaiKey)}
              >
                {showOpenaiKey ? (
                  <EyeOff className="w-4 h-4 text-stone-400" />
                ) : (
                  <Eye className="w-4 h-4 text-stone-400" />
                )}
              </Button>
            </div>
            <p className="text-xs text-stone-400">
              Get your API key from{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 hover:underline"
              >
                platform.openai.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Settings
        </Button>
      </div>
    </form>
  );
}
