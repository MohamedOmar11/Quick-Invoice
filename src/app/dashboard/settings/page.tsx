import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UserSettingsForm } from "@/components/settings/user-settings-form";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your personal details and contact info.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input disabled defaultValue={session?.user?.name || ""} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input disabled defaultValue={session?.user?.email || ""} />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Brand Settings (Pro)</CardTitle>
          <CardDescription>Customize your invoices with your brand identity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Brand settings are available on the Pro plan.</p>
        </CardContent>
      </Card>

      <UserSettingsForm />
    </div>
  );
}
