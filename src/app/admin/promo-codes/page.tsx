"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminPromoCodes() {
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [newCode, setNewCode] = useState("");
  const [maxUses, setMaxUses] = useState(1);
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    const res = await fetch("/api/admin/promo");
    if (res.ok) {
      setPromoCodes(await res.json());
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: newCode, maxUses, duration }),
      });
      if (res.ok) {
        setNewCode("");
        setStatus({ type: "success", message: "Promo code created." });
        fetchCodes();
      } else {
        const msg = await res.text();
        setStatus({ type: "error", message: msg || "Failed to generate code." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Promo Codes</h1>
        <p className="text-muted-foreground">Manage and generate promo codes for marketing campaigns.</p>
      </div>

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
          <CardTitle>Generate New Code</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="flex flex-col md:flex-row items-end gap-4">
            <div className="space-y-2 flex-1 w-full">
              <Label>Code (e.g. FREEPRO30)</Label>
              <Input value={newCode} onChange={(e) => setNewCode(e.target.value.toUpperCase())} required placeholder="Leave blank for random" />
            </div>
            <div className="space-y-2 w-full md:w-32">
              <Label>Max Uses</Label>
              <Input type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(parseInt(e.target.value))} required />
            </div>
            <div className="space-y-2 w-full md:w-32">
              <Label>Duration (Days)</Label>
              <Input type="number" min={1} value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              Generate
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promoCodes.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell className="font-mono font-medium">{promo.code}</TableCell>
                <TableCell>{promo.duration} Days Pro</TableCell>
                <TableCell>{promo.currentUses} / {promo.maxUses}</TableCell>
                <TableCell>{new Date(promo.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
