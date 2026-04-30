"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InvoiceStylePanel } from "@/components/invoice/invoice-style-panel";
import { SimpleUploader } from "@/components/upload/simple-uploader";

type SettingsPayload = {
  instapayUrl: string;
  vodafoneCashNumber: string;
  defaultInvoiceStyle: any;
  brandName?: string;
  brandLogoUrl?: string;
};

export function UserSettingsForm({ plan }: { plan: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [instapayUrl, setInstapayUrl] = useState("");
  const [vodafoneCashNumber, setVodafoneCashNumber] = useState("");
  const [defaultInvoiceStyle, setDefaultInvoiceStyle] = useState<any>(null);
  const [brandName, setBrandName] = useState("");
  const [brandLogoUrl, setBrandLogoUrl] = useState("");
  const [brandLogoUrlInput, setBrandLogoUrlInput] = useState("");

  const formatUploadError = (error: unknown) => {
    const e = error as any;
    const msg = typeof e?.message === "string" ? e.message : "Upload failed";
    const cause = e?.cause ? String(e.cause) : "";
    return cause && !msg.includes(cause) ? `${msg}\n${cause}` : msg;
  };

  useEffect(() => {
    fetch("/api/user/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setInstapayUrl(data.instapayUrl ?? "");
        setVodafoneCashNumber(data.vodafoneCashNumber ?? "");
        setDefaultInvoiceStyle(data.defaultInvoiceStyle ?? null);
        setBrandName(data.brandName ?? "");
        setBrandLogoUrl(data.brandLogoUrl ?? "");
        setBrandLogoUrlInput(data.brandLogoUrl ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async (override?: Partial<SettingsPayload>) => {
    setSaving(true);
    setStatus(null);
    try {
      const payload: SettingsPayload = {
        instapayUrl,
        vodafoneCashNumber,
        defaultInvoiceStyle,
        brandName,
        brandLogoUrl,
        ...(override ?? {}),
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
          <CardTitle>Brand Settings</CardTitle>
          <CardDescription>Customize your invoices with your brand identity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {plan === "FREE" ? (
            <p className="text-sm text-muted-foreground">Brand settings are available on the Pro plan.</p>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input disabled={loading} value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Your Company" />
              </div>

              <div className="space-y-2">
                <Label>Company Logo</Label>
                {brandLogoUrl ? (
                  <div className="space-y-3">
                    <div className="rounded-lg border bg-muted/10 p-3 text-sm text-muted-foreground break-all">{brandLogoUrl}</div>
                    <div className="rounded-lg border overflow-hidden bg-background">
                      <img src={brandLogoUrl} alt="Company logo" className="w-full h-auto max-h-[220px] object-contain" />
                    </div>
                  </div>
                ) : null}
                <div className="grid gap-3">
                  <Input
                    disabled={loading || saving}
                    value={brandLogoUrlInput}
                    onChange={(e) => setBrandLogoUrlInput(e.target.value)}
                    placeholder="Paste logo URL (optional)"
                  />
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      className="rounded-full"
                      disabled={loading || saving || !brandLogoUrlInput.trim()}
                      onClick={() => {
                        const url = brandLogoUrlInput.trim();
                        setBrandLogoUrl(url);
                        save({ brandLogoUrl: url });
                      }}
                    >
                      Save Logo URL
                    </Button>
                  </div>
                </div>
                <SimpleUploader
                  endpoint="brandLogo"
                  disabled={loading || saving}
                  onBegin={() => {
                    setUploadingLogo(true);
                    setStatus(null);
                    setLogoProgress(0);
                  }}
                  onProgress={(p) => setLogoProgress(p)}
                  onError={(message) => {
                    setUploadingLogo(false);
                    setLogoProgress(0);
                    setStatus({ type: "error", message });
                  }}
                  onUploaded={(url) => {
                    setBrandLogoUrl(url);
                    setBrandLogoUrlInput(url);
                    setUploadingLogo(false);
                    setLogoProgress(0);
                    setStatus({ type: "success", message: "Logo uploaded." });
                    save({ brandLogoUrl: url });
                  }}
                />
                {uploadingLogo ? <div className="text-sm text-muted-foreground">Uploading… {logoProgress}%</div> : null}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => save()} disabled={loading || saving} className="rounded-full">
                  Save Brand Settings
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Settings</CardTitle>
          <CardDescription>Optional payment details shown on invoices.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>InstaPay URL</Label>
            <Input disabled={loading} value={instapayUrl} onChange={(e) => setInstapayUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Vodafone Cash Number</Label>
            <Input disabled={loading} value={vodafoneCashNumber} onChange={(e) => setVodafoneCashNumber(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => save()} disabled={loading || saving} className="rounded-full">
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      {plan === "FREE" ? (
        <Card>
          <CardHeader>
            <CardTitle>Default Invoice Style (Pro)</CardTitle>
            <CardDescription>Customize colors, spacing, and layout.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Default invoice style is available on the Pro plan.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <InvoiceStylePanel
            title="Default Invoice Style"
            value={defaultInvoiceStyle}
            onChange={setDefaultInvoiceStyle}
          />
          <div className="flex justify-end">
            <Button onClick={() => save()} disabled={loading || saving} className="rounded-full">
              Save Default Style
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
