"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PaymentRow = {
  id: string;
  userId: string;
  method: string;
  product?: string | null;
  amount: number;
  status: string;
  screenshotUrl?: string | null;
  createdAt: string;
  user?: { email?: string | null; name?: string | null; plan?: string | null };
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const load = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/payments?status=PENDING");
      if (!res.ok) {
        const msg = await res.text();
        setStatus({ type: "error", message: msg || "Failed to load payments." });
        return;
      }
      const data = await res.json();
      setPayments(data);
    } catch {
      setStatus({ type: "error", message: "Failed to load payments." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id: string) => {
    setStatus(null);
    const res = await fetch(`/api/admin/payments/${id}/approve`, { method: "POST" });
    if (!res.ok) {
      const msg = await res.text();
      setStatus({ type: "error", message: msg || "Failed to approve." });
      return;
    }
    setStatus({ type: "success", message: "Approved." });
    load();
  };

  const reject = async (id: string) => {
    setStatus(null);
    const res = await fetch(`/api/admin/payments/${id}/reject`, { method: "POST" });
    if (!res.ok) {
      const msg = await res.text();
      setStatus({ type: "error", message: msg || "Failed to reject." });
      return;
    }
    setStatus({ type: "success", message: "Rejected." });
    load();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">Approve/reject pending payments.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending</CardTitle>
          <CardDescription>Newest first.</CardDescription>
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

          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : payments.length === 0 ? (
            <div className="text-sm text-muted-foreground">No pending payments.</div>
          ) : (
            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="rounded-lg border p-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {p.user?.name || p.user?.email || p.userId}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {p.product ?? "—"} • {p.method} • {p.amount} • {new Date(p.createdAt).toLocaleString()}
                    </div>
                    {p.screenshotUrl ? (
                      <a className="text-sm text-primary hover:underline underline-offset-4" href={p.screenshotUrl} target="_blank" rel="noreferrer">
                        View screenshot
                      </a>
                    ) : (
                      <div className="text-sm text-muted-foreground">No screenshot</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button className="rounded-full" onClick={() => approve(p.id)}>
                      Approve
                    </Button>
                    <Button variant="outline" className="rounded-full" onClick={() => reject(p.id)}>
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

