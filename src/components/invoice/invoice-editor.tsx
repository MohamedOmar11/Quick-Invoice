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
import { Plus, Trash, Download, Save, Printer } from "lucide-react";
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

    const currentInvoiceNumber = form.getValues("invoiceNumber");
    if (!currentInvoiceNumber) {
      form.setValue("invoiceNumber", `INV-${Math.floor(Math.random() * 10000)}`);
    }

    const issueDate = form.getValues("issueDate");
    if (!issueDate) {
      form.setValue("issueDate", new Date().toISOString().split("T")[0]);
    }

    const dueDate = form.getValues("dueDate");
    if (!dueDate) {
      form.setValue("dueDate", new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    }
  }, [form, initialData]);

  useEffect(() => {
    const current = form.getValues("template");
    const normalized = getThemeById(current).id;
    if (current !== normalized) {
      form.setValue("template", normalized);
    }
  }, [form]);

  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [printing, setPrinting] = useState(false);
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
          setUserBrand({
            name: data.brandName ?? null,
            logoUrl: data.brandLogoUrl ?? null,
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isFree) return;
    const current = form.getValues("template");
    if (current !== "minimal-corporate") {
      form.setValue("template", "minimal-corporate");
    }
    if (form.getValues("style")) {
      form.setValue("style", undefined);
    }
  }, [form, isFree]);

  const persistInvoice = async (data: InvoiceFormData, { redirectOnCreate }: { redirectOnCreate: boolean }) => {
    setSaving(true);
    setStatus(null);

    try {
      const { url, method } = buildInvoiceSaveRequest(data);
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, style: isFree ? undefined : data.style, subtotal, total, taxAmount }),
      });

      if (!res.ok) {
        const msg = await res.text();
        setStatus({ type: "error", message: msg || "Failed to save invoice." });
        return null;
      }

      const invoice = (await res.json()) as { id: string };
      form.setValue("id", invoice.id);

      if (!data.id && redirectOnCreate) {
        router.push(`/dashboard/invoice/${invoice.id}?saved=1`);
        return invoice.id;
      }

      setStatus({ type: "success", message: "Invoice saved." });
      return invoice.id;
    } catch (e) {
      setStatus({ type: "error", message: "Failed to save invoice." });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = form.handleSubmit(async (data) => {
    setExporting(true);
    const invoiceId = await persistInvoice({ ...data, id: form.getValues("id") || initialData?.id }, { redirectOnCreate: true });
    if (invoiceId) window.open(`/api/invoices/${invoiceId}/pdf`, "_blank");
    window.setTimeout(() => setExporting(false), 1000);
  });

  const handlePrint = form.handleSubmit(async (data) => {
    setPrinting(true);
    const invoiceId = await persistInvoice({ ...data, id: form.getValues("id") || initialData?.id }, { redirectOnCreate: true });
    if (invoiceId) window.open(`/api/invoices/${invoiceId}/pdf`, "_blank");
    window.setTimeout(() => setPrinting(false), 1000);
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 max-w-7xl mx-auto h-[calc(100vh-4rem)]">
      {/* Editor Form */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6 overflow-y-auto pr-4 pb-16">
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

        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b -mx-4 px-4 py-3 rounded-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight truncate">
                {watchAll.id ? "Edit invoice" : "New invoice"}
              </h2>
              <div className="text-xs text-muted-foreground truncate">
                {saving ? "Saving…" : exporting ? "Generating PDF…" : printing ? "Preparing print…" : "All changes are local until you save."}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={form.handleSubmit((data) => persistInvoice(data, { redirectOnCreate: true }))} disabled={saving} className="rounded-full">
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
              <Button variant="outline" onClick={handlePrint} disabled={saving || printing} className="rounded-full">
                <Printer className="w-4 h-4 mr-2" /> Print
              </Button>
              <Button onClick={handleDownload} disabled={saving || exporting} className="rounded-full">
                <Download className="w-4 h-4 mr-2" /> PDF
              </Button>
            </div>
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

          <div className="grid grid-cols-2 gap-4">
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
                <SelectTrigger>
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                  {(isFree ? themes.filter((t) => t.id === "minimal-corporate") : themes).map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          style={buildInvoiceStyle(selectedTheme.tokens, userDefaultStyle, watchAll.style)}
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
          direction={selectedTheme.direction}
          brand={userBrand ?? undefined}
          watermarkText={isFree ? "Created with Hesaby" : undefined}
        />
      </div>
    </div>
  );
}
