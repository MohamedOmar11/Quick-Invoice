"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AppSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [ownerInstapayUrl, setOwnerInstapayUrl] = useState("");
  const [ownerVodafoneCashNumber, setOwnerVodafoneCashNumber] = useState("");

  useEffect(() => {
    fetch("/api/admin/app-settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setOwnerInstapayUrl(data.ownerInstapayUrl ?? "");
        setOwnerVodafoneCashNumber(data.ownerVodafoneCashNumber ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/app-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerInstapayUrl, ownerVodafoneCashNumber }),
      });
      if (!res.ok) {
        const msg = await res.text();
        setStatus({ type: "error", message: msg || "Failed to save." });
        return;
      }
      setStatus({ type: "success", message: "Saved." });
    } catch {
      setStatus({ type: "error", message: "Failed to save." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>App Settings</CardTitle>
        <CardDescription>Owner payment info used for subscription payments.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              status.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-red-200 bg-red-50 text-red-900"
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="space-y-2">
          <Label>Owner InstaPay URL</Label>
          <Input disabled={loading} value={ownerInstapayUrl} onChange={(e) => setOwnerInstapayUrl(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Owner Vodafone Cash Number</Label>
          <Input disabled={loading} value={ownerVodafoneCashNumber} onChange={(e) => setOwnerVodafoneCashNumber(e.target.value)} />
        </div>

        <div className="flex justify-end">
          <Button onClick={save} disabled={loading || saving}>
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

