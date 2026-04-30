"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash, Download, Save, Printer, Eye, FileEdit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildInvoiceSaveRequest } from "@/lib/invoice-client";
import { InvoicePreview } from "@/components/invoice/invoice-preview";
import { InvoiceStylePanel } from "@/components/invoice/invoice-style-panel";
import { buildInvoiceStyle } from "@/components/invoice/invoice-style";
import { themes, getThemeById } from "@/components/invoice/themes";

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
  const { data: session } = useSession();
  const [userDefaultStyle, setUserDefaultStyle] = useState<any>(null);
  const [userPayment, setUserPayment] = useState<{ instapayUrl?: string | null; vodafoneCashNumber?: string | null } | null>(null);
  const [userBrand, setUserBrand] = useState<{ name?: string | null; logoUrl?: string | null } | null>(null);
  const isFree = (session?.user as any)?.plan === "FREE";
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");

  const defaultValues: InvoiceFormData = initialData || {
    invoiceNumber: "",
    clientName: "",
    clientEmail: "",
    issueDate: "",
    dueDate: "",
    currency: "EGP",
    tax: 0,
    notes: "Thank you for your business!",
    template: "minimal-corporate",
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
  const selectedTheme = getThemeById(watchAll.template);

  useEffect(() => {
    if (initialData) return;
    if (!form.getValues("invoiceNumber")) form.setValue("invoiceNumber", `INV-${Math.floor(Math.random() * 10000)}`);
    if (!form.getValues("issueDate")) form.setValue("issueDate", new Date().toISOString().split("T")[0]);
    if (!form.getValues("dueDate")) form.setValue("dueDate", new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  }, [form, initialData]);

  useEffect(() => {
    fetch("/api/user/settings").then(r => r.ok ? r.json() : null).then(d => {
      if (!d) return;
      if (d.defaultStyle) setUserDefaultStyle(d.defaultStyle);
      if (!initialData && d.defaultStyle) form.setValue("style", d.defaultStyle);
      setUserPayment({ instapayUrl: d.instapayUrl, vodafoneCashNumber: d.vodafoneCashNumber });
      setUserBrand({ name: d.brandName, logoUrl: d.brandLogoUrl });
    });
  }, []);

  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function persistInvoice(data: InvoiceFormData, opts?: { redirectOnCreate?: boolean }) {
    setSaving(true);
    setStatus(null);
    try {
      const body = buildInvoiceSaveRequest(data, { subtotal, total });
      const isNew = !data.id;
      const url = isNew ? "/api/invoices" : `/api/invoices/${data.id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) {
        const msg = await res.text();
        setStatus({ type: "error", message: msg || "Failed to save." });
        return;
      }
      const saved = await res.json();
      if (isNew) {
        form.setValue("id", saved.id);
        if (opts?.redirectOnCreate) router.push(`/dashboard/invoice/${saved.id}`);
      }
      setStatus({ type: "success", message: "Saved!" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDownload() {
    const data = form.getValues();
    await persistInvoice(data);
    const invoiceId = form.getValues("id");
    if (!invoiceId) return;
    setExporting(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pdf`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${form.getValues("invoiceNumber")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  async function handlePrint() {
    const data = form.getValues();
    await persistInvoice(data);
    const invoiceId = form.getValues("id");
    if (!invoiceId) return;
    setPrinting(true);
    try {
      const printUrl = `/api/invoices/${invoiceId}/html`;
      const win = window.open(printUrl, "_blank");
      if (win) {
        win.onload = () => {
          win.print();
          setPrinting(false);
        };
      } else {
        setPrinting(false);
      }
    } catch {
      setPrinting(false);
    }
  }

  const previewData = {
    invoiceNumber: watchAll.invoiceNumber,
    clientName: watchAll.clientName,
    clientEmail: watchAll.clientEmail,
    issueDate: watchAll.issueDate,
    dueDate: watchAll.dueDate,
    currency: watchAll.currency,
    tax: watchAll.tax,
    notes: watchAll.notes,
    items: watchAll.items,
  };

  const builtStyle = buildInvoiceStyle(selectedTheme.tokens, userDefaultStyle, watchAll.style);

  return (
    <div className="flex flex-col h-full">
      {/* Mobile tab switcher */}
      <div className="lg:hidden flex border-b bg-background sticky top-0 z-20">
        <button
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${mobileTab === "form" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
          onClick={() => setMobileTab("form")}
        >
          <FileEdit className="w-4 h-4" /> Edit
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${mobileTab === "preview" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
          onClick={() => setMobileTab("preview")}
        >
          <Eye className="w-4 h-4" /> Preview
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-0 lg:gap-8 lg:p-6 max-w-7xl mx-auto w-full lg:h-[calc(100vh-5rem)]">
        {/* Editor Form */}
        <div className={`w-full lg:w-1/2 flex flex-col gap-6 lg:overflow-y-auto p-4 lg:p-0 lg:pr-4 pb-24 lg:pb-16 ${mobileTab === "preview" ? "hidden lg:flex" : "flex"}`}>
          {status && (
            <div className={`rounded-lg border px-4 py-3 text-sm ${status.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800" : "border-red-200 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-200 dark:border-red-800"}`}>
              {status.message}
            </div>
          )}

          {/* Sticky action bar */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b -mx-4 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-base font-semibold tracking-tight truncate">
                  {watchAll.id ? "Edit invoice" : "New invoice"}
                </h2>
                <div className="text-xs text-muted-foreground truncate">
                  {saving ? "Saving…" : exporting ? "Generating PDF…" : printing ? "Preparing…" : "Unsaved changes"}
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Button size="sm" variant="outline" onClick={form.handleSubmit((data) => persistInvoice(data, { redirectOnCreate: true }))} disabled={saving} className="rounded-full px-3">
                  <Save className="w-3.5 h-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Save</span>
                </Button>
                <Button size="sm" variant="outline" onClick={handlePrint} disabled={saving || printing} className="rounded-full px-3">
                  <Printer className="w-3.5 h-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Print</span>
                </Button>
                <Button size="sm" onClick={handleDownload} disabled={saving || exporting} className="rounded-full px-3">
                  <Download className="w-3.5 h-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">PDF</span>
                </Button>
              </div>
            </div>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={selectedTheme.id}
                onValueChange={(v) => {
                  if (!v) return;
                  if (isFree && v !== "minimal-corporate") return;
                  form.setValue("template", v);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                  {(isFree ? themes.filter((t) => t.id === "minimal-corporate") : themes).map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isFree ? (
              <div className="rounded-lg border bg-muted/10 p-4 text-sm text-muted-foreground">
                Style customization is available on the Pro plan.
              </div>
            ) : (
              <InvoiceStylePanel
                title="Style (this invoice)"
                value={watchAll.style}
                onChange={(next) => form.setValue("style", next)}
              />
            )}

            <div className="space-y-4">
              <h3 className="font-semibold">Client Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <h3 className="font-semibold">Items</h3>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-start bg-muted/20 p-4 rounded-lg border">
                  <div className="flex-1 space-y-3">
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input {...form.register(`items.${index}.title`)} placeholder="Web Development Services" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Qty</Label>
                        <Input type="number" {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Price</Label>
                        <Input type="number" {...form.register(`items.${index}.price`, { valueAsNumber: true })} />
                      </div>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="mt-8 text-destructive shrink-0" onClick={() => remove(index)}>
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => append({ title: "", quantity: 1, price: 0 })}>
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className={`w-full lg:w-1/2 bg-muted/30 rounded-xl p-4 lg:p-8 lg:overflow-y-auto border shadow-inner ${mobileTab === "form" ? "hidden lg:block" : "block"}`}>
          <InvoicePreview
            themeId={selectedTheme.id}
            style={builtStyle}
            data={previewData}
            payment={userPayment ?? undefined}
            direction={selectedTheme.direction}
            brand={userBrand ?? undefined}
            watermarkText={isFree ? "Created with Hesaby" : undefined}
          />
        </div>
      </div>
    </div>
  );
}
