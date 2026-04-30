import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Search, FileText, MoreVertical, Edit, Copy, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { normalizeClientFilter } from "@/lib/dashboard-filters";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  const sp = await searchParams;
  const clientFilter = normalizeClientFilter(sp?.client);

  const invoices = await prisma.invoice.findMany({
    where: {
      userId: session.user.id,
      ...(clientFilter
        ? { clientName: { contains: clientFilter, mode: "insensitive" } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Manage and track your invoices.</p>
        </div>
        <Button asChild className="rounded-full shadow-sm md:hidden">
          <Link href="/dashboard/invoice/new">
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <form className="relative flex-1 max-w-md" action="/dashboard" method="GET">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="client"
            type="search"
            defaultValue={clientFilter}
            placeholder="Filter by client name..."
            className="pl-9 bg-background rounded-full"
          />
        </form>
        {clientFilter ? (
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard">Clear</Link>
          </Button>
        ) : null}
      </div>

      {invoices.length === 0 ? (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 border border-primary/10">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Create your first invoice</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
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
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base">Recent invoices</CardTitle>
              <CardDescription>
                {clientFilter ? `Showing ${invoices.length} results.` : `Showing ${invoices.length} invoices.`}
              </CardDescription>
            </div>
            <Button asChild className="rounded-full hidden md:inline-flex">
              <Link href="/dashboard/invoice/new">
                <Plus className="w-4 h-4 mr-2" />
                Create invoice
              </Link>
            </Button>
          </CardHeader>
          <Table className="[&_td]:py-3">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
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
                    <div className="flex items-center gap-3 min-w-[220px]">
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                        {(invoice.clientName || "C")
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((p) => p[0]?.toUpperCase())
                          .join("")}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{invoice.clientName}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(invoice.issueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium text-right">
                    {invoice.total.toFixed(2)} {invoice.currency}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer">
                          <Link href={`/dashboard/invoice/${invoice.id}`} className="flex items-center w-full">
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
