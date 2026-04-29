"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    // Implement API call
    const res = await fetch("/api/admin/payments");
    if (res.ok) {
      setPayments(await res.json());
    }
  };

  const handleApprove = async (id: string, status: "APPROVED" | "REJECTED") => {
    const res = await fetch(`/api/admin/payments/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setStatus({ type: "success", message: "Payment updated." });
      fetchPayments();
    } else {
      const msg = await res.text();
      setStatus({ type: "error", message: msg || "Failed to update status." });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manual Payments</h1>
        <p className="text-muted-foreground">Approve or reject manual InstaPay and Vodafone Cash payments.</p>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Email</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Screenshot</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.user?.email}</TableCell>
                <TableCell>{payment.method}</TableCell>
                <TableCell>{payment.amount} EGP</TableCell>
                <TableCell>
                  <Badge variant={payment.status === "PENDING" ? "secondary" : payment.status === "APPROVED" ? "default" : "destructive"}>
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {payment.screenshotUrl ? (
                    <a href={payment.screenshotUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                      View Screenshot
                    </a>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {payment.status === "PENDING" && (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="default" onClick={() => handleApprove(payment.id, "APPROVED")}>Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleApprove(payment.id, "REJECTED")}>Reject</Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
