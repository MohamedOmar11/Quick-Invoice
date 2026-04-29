"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash, Download, Save, Printer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildInvoiceSaveRequest } from "@/lib/invoice-client";
import { InvoicePreview } from "@/components/invoice/invoice-preview";
import { InvoiceStylePanel } from "@/components/invoice/invoice-style-panel";
import { mergeInvoiceStyle } from "@/components/invoice/invoice-style";

const invoiceSchema = z.object({
  id: z.string().optional(),
  invoiceNumber: z.string().min(1, "Required"),
  clientName: z.string().min(1, "Required"),
  clientEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  issueDate: z.string(),
  dueDate: z.string(),
  currency: z.string(),
  tax: z.number().min(0),
  notes: z.string().optional(),
  template: z.string(),
  style: z.any().optional(),
  items: z.array(z.object({
    title: z.string().min(1, "Required"),
    quantity: z.number().min(1),
    price: z.number().min(0),
  })).min(1, "Add at least one item"),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

export function InvoiceEditor({ initialData }: { initialData?: InvoiceFormData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userDefaultStyle, setUserDefaultStyle] = useState<any>(null);
  const [userPayment, setUserPayment] = useState<{ instapayUrl?: string | null; vodafoneCashNumber?: string | null } | null>(null);
  const defaultValues: InvoiceFormData = initialData || {
    invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
    clientName: "",
    clientEmail: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    currency: "EGP",
    tax: 0,
    notes: "Thank you for your business!",
    template: "minimal",
    style: undefined,
    items: [{ title: "", quantity: 1, price: 0 }],
  };

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchAll = form.watch();

  const subtotal = watchAll.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const taxAmount = subtotal * (watchAll.tax / 100);
  const total = subtotal + taxAmount;

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (searchParams.get("saved") === "1") {
      setStatus({ type: "success", message: "Invoice saved." });
      router.replace(window.location.pathname);
    }
  }, [router, searchParams]);

  useEffect(() => {
    fetch("/api/user/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.defaultInvoiceStyle) setUserDefaultStyle(data.defaultInvoiceStyle);
        if (data) {
          setUserPayment({
            instapayUrl: data.instapayUrl ?? null,
            vodafoneCashNumber: data.vodafoneCashNumber ?? null,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (data: InvoiceFormData) => {
    setSaving(true);
    setStatus(null);

    try {
      const { url, method } = buildInvoiceSaveRequest(data);
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, subtotal, total, taxAmount }),
      });

      if (!res.ok) {
        const msg = await res.text();
        setStatus({ type: "error", message: msg || "Failed to save invoice." });
        return;
      }

      const invoice = (await res.json()) as { id: string };
      form.setValue("id", invoice.id);

      if (!data.id) {
        router.push(`/dashboard/invoice/${invoice.id}?saved=1`);
        return;
      }

      setStatus({ type: "success", message: "Invoice saved." });
    } catch (e) {
      setStatus({ type: "error", message: "Failed to save invoice." });
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    const invoiceId = form.getValues("id") || initialData?.id;
    if (!invoiceId) {
      setStatus({ type: "error", message: "Save the invoice before downloading the PDF." });
      return;
    }
    window.open(`/api/invoices/${invoiceId}/pdf`, "_blank");
  };

  const handlePrint = async () => {
    const invoiceId = form.getValues("id") || initialData?.id;
    if (!invoiceId) {
      setStatus({ type: "error", message: "Save the invoice before printing." });
      return;
    }
    window.open(`/api/invoices/${invoiceId}/pdf`, "_blank");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 max-w-7xl mx-auto h-[calc(100vh-4rem)]">
      {/* Editor Form */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6 overflow-y-auto pr-4 pb-20">
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

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Edit Invoice</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={form.handleSubmit(handleSave)} disabled={saving}>
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
            <Button variant="outline" onClick={handlePrint} disabled={saving}>
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
            <Button onClick={handleDownload} disabled={saving}>
              <Download className="w-4 h-4 mr-2" /> PDF
            </Button>
          </div>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Invoice Number</Label>
              <Input {...form.register("invoiceNumber")} />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={watchAll.currency} onValueChange={(v) => { if (v) form.setValue("currency", v) }}>
                <SelectTrigger><SelectValue placeholder="Currency" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EGP">EGP - Egyptian Pound</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <InvoiceStylePanel
            title="Style (this invoice)"
            value={watchAll.style}
            onChange={(next) => form.setValue("style", next)}
          />

          <div className="space-y-4">
            <h3 className="font-semibold">Client Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client Name</Label>
                <Input {...form.register("clientName")} placeholder="Acme Corp" />
              </div>
              <div className="space-y-2">
                <Label>Client Email</Label>
                <Input {...form.register("clientEmail")} type="email" placeholder="billing@acme.com" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Issue Date</Label>
              <Input {...form.register("issueDate")} type="date" />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input {...form.register("dueDate")} type="date" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Items</h3>
            </div>
            
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start bg-muted/20 p-4 rounded-lg border">
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input {...form.register(`items.${index}.title`)} placeholder="Web Development Services" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Qty</Label>
                      <Input 
                        type="number" 
                        {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price</Label>
                      <Input 
                        type="number" 
                        {...form.register(`items.${index}.price`, { valueAsNumber: true })} 
                      />
                    </div>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon" className="mt-8 text-destructive" onClick={() => remove(index)}>
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => append({ title: "", quantity: 1, price: 0 })}>
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tax %</Label>
              <Input type="number" {...form.register("tax", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea {...form.register("notes")} placeholder="Payment instructions..." />
          </div>
        </form>
      </div>

      {/* Live Preview */}
      <div className="w-full lg:w-1/2 bg-muted/30 rounded-xl p-4 lg:p-8 overflow-y-auto border shadow-inner">
        <InvoicePreview
          style={mergeInvoiceStyle(userDefaultStyle, watchAll.style)}
          data={{
            invoiceNumber: watchAll.invoiceNumber,
            clientName: watchAll.clientName,
            clientEmail: watchAll.clientEmail,
            issueDate: watchAll.issueDate,
            dueDate: watchAll.dueDate,
            currency: watchAll.currency,
            tax: watchAll.tax,
            notes: watchAll.notes,
            items: watchAll.items,
          }}
          payment={userPayment ?? undefined}
        />
      </div>
    </div>
  );
}
