"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Promo = {
  id: string;
  code: string;
  product?: string | null;
  duration?: number | null;
  maxUses: number;
  currentUses: number;
  expiresAt?: string | null;
  createdAt: string;
};

export default function AdminPromoCodesPage() {
  const [items, setItems] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [code, setCode] = useState("");
  const [product, setProduct] = useState<string>("PRO_MONTHLY");
  const [duration, setDuration] = useState<string>("");
  const [maxUses, setMaxUses] = useState<number>(1);
  const [expiresAt, setExpiresAt] = useState<string>("");

  const load = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/promo-codes");
      if (!res.ok) {
        const msg = await res.text();
        setStatus({ type: "error", message: msg || "Failed to load promo codes." });
        return;
      }
      setItems(await res.json());
    } catch {
      setStatus({ type: "error", message: "Failed to load promo codes." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    setStatus(null);
    const res = await fetch("/api/admin/promo-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        product: product || null,
        duration: duration ? Number(duration) : null,
        maxUses,
        expiresAt: expiresAt || null,
      }),
    });
    if (!res.ok) {
      const msg = await res.text();
      setStatus({ type: "error", message: msg || "Failed to create." });
      return;
    }
    setStatus({ type: "success", message: "Created." });
    setCode("");
    setDuration("");
    setMaxUses(1);
    setExpiresAt("");
    load();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Promo Codes</h1>
        <p className="text-muted-foreground">Create and manage promo codes.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create</CardTitle>
          <CardDescription>Use product OR duration days.</CardDescription>
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

          <div className="grid md:grid-cols-5 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Code</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="WELCOME50" />
            </div>
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={product} onValueChange={(v) => setProduct(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRO_MONTHLY">PRO_MONTHLY</SelectItem>
                  <SelectItem value="PRO_YEARLY">PRO_YEARLY</SelectItem>
                  <SelectItem value="LIFETIME">LIFETIME</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Duration days (optional)</Label>
              <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="30" />
            </div>
            <div className="space-y-2">
              <Label>Max uses</Label>
              <Input type="number" value={maxUses} onChange={(e) => setMaxUses(Number(e.target.value))} />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Expires at (optional)</Label>
              <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>
            <div className="md:col-span-2 flex items-end justify-end">
              <Button className="rounded-full" onClick={create} disabled={!code}>
                Create
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All codes</CardTitle>
          <CardDescription>Newest first.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-muted-foreground">No promo codes.</div>
          ) : (
            <div className="space-y-3">
              {items.map((p) => (
                <div key={p.id} className="rounded-lg border p-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="font-medium">{p.code}</div>
                    <div className="text-sm text-muted-foreground">
                      {p.product ?? "—"} {p.duration ? `• ${p.duration} days` : ""} • uses {p.currentUses}/{p.maxUses}
                      {p.expiresAt ? ` • expires ${new Date(p.expiresAt).toLocaleDateString()}` : ""}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">id: {p.id}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
