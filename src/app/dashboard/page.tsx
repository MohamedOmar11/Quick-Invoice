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

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  const invoices = await prisma.invoice.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
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
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search invoices..."
            className="pl-9 bg-background rounded-full"
          />
        </div>
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent invoices</CardTitle>
            <CardDescription>Latest invoices you created.</CardDescription>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-muted/40">
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/invoice/${invoice.id}`} className="hover:underline underline-offset-4">
                      {invoice.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{invoice.clientName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(invoice.issueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">
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
