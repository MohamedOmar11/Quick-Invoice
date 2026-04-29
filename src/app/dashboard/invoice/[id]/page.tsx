import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InvoiceEditor } from "@/components/invoice/invoice-editor";
import { redirect } from "next/navigation";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id },
  });

  if (!invoice || invoice.userId !== session.user.id) {
    redirect("/dashboard");
  }

  // Transform data for the form
  const initialData = {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    clientName: invoice.clientName,
    clientEmail: invoice.clientEmail || "",
    issueDate: invoice.issueDate.toISOString().split("T")[0],
    dueDate: invoice.dueDate.toISOString().split("T")[0],
    currency: invoice.currency,
    tax: invoice.tax,
    notes: invoice.notes || "",
    template: invoice.template,
    items: invoice.items as any,
  };

  return <InvoiceEditor initialData={initialData} />;
}
