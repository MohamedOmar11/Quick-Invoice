"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PlanManager() {
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<"FREE" | "PRO" | "LIFETIME">("FREE");
  const [planExpiresAt, setPlanExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const submit = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/users/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          plan,
          planExpiresAt: plan === "LIFETIME" ? null : planExpiresAt || null,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        setStatus({ type: "error", message: msg || "Failed to update plan." });
        return;
      }

      setStatus({ type: "success", message: "Plan updated." });
    } catch {
      setStatus({ type: "error", message: "Failed to update plan." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change User Plan</CardTitle>
        <CardDescription>Set a user plan by email.</CardDescription>
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
          <Label>User Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@email.com" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Plan</Label>
            <Select value={plan} onValueChange={(v) => setPlan(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FREE">FREE</SelectItem>
                <SelectItem value="PRO">PRO</SelectItem>
                <SelectItem value="LIFETIME">LIFETIME</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Plan Expires At</Label>
            <Input
              type="date"
              value={planExpiresAt}
              onChange={(e) => setPlanExpiresAt(e.target.value)}
              disabled={plan === "LIFETIME"}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={submit} disabled={loading || !email}>
            Update
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

