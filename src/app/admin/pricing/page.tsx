"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Pricing = { currency: string; proMonthly: number; proYearly: number; lifetime: number };

export default function AdminPricingPage() {
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/app-settings/pricing")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setPricing({
          currency: data.currency ?? "EGP",
          proMonthly: Number(data.proMonthly ?? 150),
          proYearly: Number(data.proYearly ?? 1500),
          lifetime: Number(data.lifetime ?? 3000),
        });
      })
      .catch(() => {});
  }, []);

  const save = async () => {
    if (!pricing) return;
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/app-settings/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pricing),
      });
      if (!res.ok) {
        const msg = await res.text();
        setStatus({ type: "error", message: msg || "Failed to save." });
        return;
      }
      const next = await res.json();
      setPricing({
        currency: next.currency ?? "EGP",
        proMonthly: Number(next.proMonthly ?? 150),
        proYearly: Number(next.proYearly ?? 1500),
        lifetime: Number(next.lifetime ?? 3000),
      });
      setStatus({ type: "success", message: "Saved." });
    } catch {
      setStatus({ type: "error", message: "Failed to save." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pricing</h1>
        <p className="text-muted-foreground">Single source of truth used across landing, billing, and payments.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan prices</CardTitle>
          <CardDescription>Update values and save.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input
                value={pricing?.currency ?? ""}
                onChange={(e) => pricing && setPricing({ ...pricing, currency: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Pro Monthly</Label>
              <Input
                type="number"
                value={pricing?.proMonthly ?? 0}
                onChange={(e) => pricing && setPricing({ ...pricing, proMonthly: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Pro Yearly</Label>
              <Input
                type="number"
                value={pricing?.proYearly ?? 0}
                onChange={(e) => pricing && setPricing({ ...pricing, proYearly: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Lifetime</Label>
              <Input
                type="number"
                value={pricing?.lifetime ?? 0}
                onChange={(e) => pricing && setPricing({ ...pricing, lifetime: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={save} disabled={!pricing || saving} className="rounded-full">
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

