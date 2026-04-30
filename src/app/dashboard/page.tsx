import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { normalizeClientFilter } from "@/lib/dashboard-filters";
import { InvoiceRowActions } from "@/components/dashboard/invoice-row-actions";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const sp = await searchParams;
  const clientFilter = normalizeClientFilter(sp?.client);

  const invoices = await prisma.invoice.findMany({
    where: {
      userId: session.user.id,
      ...(clientFilter ? { clientName: { contains: clientFilter, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground text-sm">Manage and track your invoices.</p>
        </div>
        <Button asChild className="rounded-full shadow-sm md:hidden">
          <Link href="/dashboard/invoice/new">
            <Plus className="w-4 h-4 mr-2" /> Create
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <form className="relative flex-1 max-w-md" action="/dashboard" method="GET">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="client"
            type="search"
            defaultValue={clientFilter}
            placeholder="Filter by client..."
            className="pl-9 bg-background rounded-full"
          />
        </form>
        {clientFilter && (
          <Button asChild variant="outline" className="rounded-full shrink-0">
            <Link href="/dashboard">Clear</Link>
          </Button>
        )}
      </div>

      {invoices.length === 0 ? (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 border border-primary/10">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Create your first invoice</h3>
            <p className="text-muted-foreground mb-6 max-w-sm text-sm">
              Start with a clean template, add items, and export a PDF in one click.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="rounded-full px-6">
                <Link href="/dashboard/invoice/new">Create invoice</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-6">
                <Link href="/dashboard/billing">Upgrade</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Recent invoices</CardTitle>
              <CardDescription>
                {clientFilter ? `${invoices.length} results` : `${invoices.length} invoices`}
              </CardDescription>
            </div>
            <Button asChild className="rounded-full hidden md:inline-flex">
              <Link href="/dashboard/invoice/new">
                <Plus className="w-4 h-4 mr-2" /> Create invoice
              </Link>
            </Button>
          </CardHeader>

          {/* Desktop table */}
          <div className="hidden sm:block">
            <Table className="[&_th]:px-4 [&_td]:px-4 [&_td]:py-3">
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice: any) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="font-medium">
                        <Link href={`/dashboard/invoice/${invoice.id}`} className="hover:underline underline-offset-4">
                          {invoice.invoiceNumber}
                        </Link>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(invoice.createdAt).toLocaleString(undefined, { dateStyle: "medium" })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                          {(invoice.clientName || "C").split(" ").filter(Boolean).slice(0, 2).map((p: string) => p[0]?.toUpperCase()).join("")}
                        </div>
                        <span className="font-medium truncate max-w-[140px]">{invoice.clientName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium text-right">
                      {invoice.total.toFixed(2)} {invoice.currency}
                    </TableCell>
                    <TableCell>
                      <InvoiceRowActions invoiceId={invoice.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile card list */}
          <div className="sm:hidden divide-y">
            {invoices.map((invoice: any) => (
              <div key={invoice.id} className="flex items-center gap-3 px-4 py-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                  {(invoice.clientName || "C").split(" ").filter(Boolean).slice(0, 2).map((p: string) => p[0]?.toUpperCase()).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/dashboard/invoice/${invoice.id}`} className="font-medium text-sm hover:underline underline-offset-4 truncate block">
                    {invoice.invoiceNumber}
                  </Link>
                  <div className="text-xs text-muted-foreground truncate">{invoice.clientName}</div>
                  <div className="text-xs text-muted-foreground">{new Date(invoice.issueDate).toLocaleDateString()}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-sm">{invoice.total.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{invoice.currency}</div>
                </div>
                <InvoiceRowActions invoiceId={invoice.id} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
