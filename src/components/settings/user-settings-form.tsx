"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InvoiceStylePanel } from "@/components/invoice/invoice-style-panel";

type SettingsPayload = {
  instapayHandle: string;
  vodafoneCashNumber: string;
  defaultInvoiceStyle: any;
};

export function UserSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [instapayHandle, setInstapayHandle] = useState("");
  const [vodafoneCashNumber, setVodafoneCashNumber] = useState("");
  const [defaultInvoiceStyle, setDefaultInvoiceStyle] = useState<any>(null);

  useEffect(() => {
    fetch("/api/user/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setInstapayHandle(data.instapayHandle ?? "");
        setVodafoneCashNumber(data.vodafoneCashNumber ?? "");
        setDefaultInvoiceStyle(data.defaultInvoiceStyle ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const payload: SettingsPayload = {
        instapayHandle,
        vodafoneCashNumber,
        defaultInvoiceStyle,
      };
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await res.text();
        setStatus({ type: "error", message: msg || "Failed to save settings." });
        return;
      }
      setStatus({ type: "success", message: "Settings saved." });
    } catch {
      setStatus({ type: "error", message: "Failed to save settings." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {status && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            status.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {status.message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment Settings</CardTitle>
          <CardDescription>Optional payment details shown on invoices.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>InstaPay Handle</Label>
            <Input disabled={loading} value={instapayHandle} onChange={(e) => setInstapayHandle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Vodafone Cash Number</Label>
            <Input disabled={loading} value={vodafoneCashNumber} onChange={(e) => setVodafoneCashNumber(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={save} disabled={loading || saving}>
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      <InvoiceStylePanel
        title="Default Invoice Style"
        value={defaultInvoiceStyle}
        onChange={setDefaultInvoiceStyle}
      />

      <div className="flex justify-end">
        <Button onClick={save} disabled={loading || saving}>
          Save Default Style
        </Button>
      </div>
    </div>
  );
}

