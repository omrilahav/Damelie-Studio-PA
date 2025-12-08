import { Header } from "@/components/layout/header";
import { SettingsForm } from "@/components/settings/settings-form";
import { db } from "@/lib/db";

async function getSettings() {
  let settings = await db.systemSettings.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    settings = await db.systemSettings.create({
      data: { id: "default" },
    });
  }

  // Return settings with flags for API key status (not the actual keys)
  return {
    id: settings.id,
    userName: settings.userName,
    defaultCurrency: settings.defaultCurrency,
    workingHoursPerDay: settings.workingHoursPerDay,
    weeklyCapacityHours: settings.weeklyCapacityHours,
    marginWarningThreshold: settings.marginWarningThreshold,
    aiProvider: settings.aiProvider,
    hasAnthropicKey: !!settings.anthropicApiKey,
    hasOpenaiKey: !!settings.openaiApiKey,
  };
}

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <>
      <Header 
        title="Settings" 
        subtitle="Configure your personal assistant"
      />
      
      <div className="p-6 max-w-2xl">
        <SettingsForm settings={settings} />
      </div>
    </>
  );
}
