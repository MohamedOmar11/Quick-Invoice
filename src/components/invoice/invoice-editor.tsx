"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash, Download, Save, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  items: z.array(z.object({
    title: z.string().min(1, "Required"),
    quantity: z.number().min(1),
    price: z.number().min(0),
  })).min(1, "Add at least one item"),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

export function InvoiceEditor({ initialData }: { initialData?: InvoiceFormData }) {
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

  const handleSave = async (data: InvoiceFormData) => {
    // API Call to save invoice
    const res = await fetch("/api/invoices", {
      method: data.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, subtotal, total, taxAmount }),
    });

    if (res.ok) {
      alert("Invoice saved successfully");
    }
  };

  const handleDownload = async () => {
    if (!initialData?.id) {
      alert("Please save the invoice first before downloading the PDF.");
      return;
    }
    window.open(`/api/invoices/${initialData.id}/pdf`, "_blank");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 max-w-7xl mx-auto h-[calc(100vh-4rem)]">
      {/* Editor Form */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6 overflow-y-auto pr-4 pb-20">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Edit Invoice</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={form.handleSubmit(handleSave)}>
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
            <Button onClick={handleDownload}>
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
        <div className="bg-white text-black p-8 rounded-lg shadow-lg max-w-2xl mx-auto aspect-[1/1.4] relative print-ready">
          {/* Minimal Template Preview */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-4xl font-light text-gray-900 tracking-tighter mb-2">INVOICE</h1>
              <p className="text-gray-500 text-sm">#{watchAll.invoiceNumber}</p>
            </div>
            <div className="text-right">
              {/* Brand logo would go here */}
              <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 font-bold mb-4 ml-auto">LOGO</div>
              <h2 className="font-semibold text-gray-800">Your Company</h2>
            </div>
          </div>

          <div className="flex justify-between mb-12">
            <div>
              <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase mb-1">Bill To</p>
              <p className="font-semibold text-gray-800 text-lg">{watchAll.clientName || "Client Name"}</p>
              {watchAll.clientEmail && <p className="text-gray-600 text-sm">{watchAll.clientEmail}</p>}
            </div>
            <div className="text-right">
              <div className="mb-4">
                <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase mb-1">Issue Date</p>
                <p className="text-gray-800 text-sm">{watchAll.issueDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase mb-1">Due Date</p>
                <p className="text-gray-800 text-sm">{watchAll.dueDate}</p>
              </div>
            </div>
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 text-xs text-gray-500 font-semibold tracking-wider uppercase">Description</th>
                <th className="text-right py-3 text-xs text-gray-500 font-semibold tracking-wider uppercase">Qty</th>
                <th className="text-right py-3 text-xs text-gray-500 font-semibold tracking-wider uppercase">Price</th>
                <th className="text-right py-3 text-xs text-gray-500 font-semibold tracking-wider uppercase">Amount</th>
              </tr>
            </thead>
            <tbody>
              {watchAll.items.map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-4 text-gray-800 text-sm">{item.title || "Item description"}</td>
                  <td className="text-right py-4 text-gray-600 text-sm">{item.quantity}</td>
                  <td className="text-right py-4 text-gray-600 text-sm">{item.price.toFixed(2)}</td>
                  <td className="text-right py-4 text-gray-800 font-medium text-sm">{(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-12">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)} {watchAll.currency}</span>
              </div>
              {watchAll.tax > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax ({watchAll.tax}%)</span>
                  <span>{taxAmount.toFixed(2)} {watchAll.currency}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg text-gray-900 border-t-2 border-gray-200 pt-3">
                <span>Total</span>
                <span>{total.toFixed(2)} {watchAll.currency}</span>
              </div>
            </div>
          </div>

          {watchAll.notes && (
            <div className="mt-16 pt-8 border-t border-gray-200 text-gray-500 text-sm">
              <p className="font-semibold text-gray-700 mb-2">Notes</p>
              <p className="whitespace-pre-wrap">{watchAll.notes}</p>
            </div>
          )}

          {/* Watermark for free plan (dummy logic for now) */}
          <div className="absolute bottom-8 left-8 text-xs text-gray-300 font-medium tracking-widest uppercase">
            Created with QuickInvoice
          </div>
        </div>
      </div>
    </div>
  );
}