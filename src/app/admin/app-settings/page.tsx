import { AppSettingsForm } from "@/components/admin/app-settings-form";

export default function AdminAppSettingsPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">App Settings</h1>
        <p className="text-muted-foreground">Configure owner payment instructions for subscription payments.</p>
      </div>
      <AppSettingsForm />
    </div>
  );
}

