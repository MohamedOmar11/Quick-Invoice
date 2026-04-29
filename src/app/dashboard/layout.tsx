import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { FileText, LayoutDashboard, Settings, CreditCard } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">QuickInvoice</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium">
            <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
            Invoices
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium">
            <Settings className="w-4 h-4 text-muted-foreground" />
            Settings
          </Link>
          <Link href="/dashboard/billing" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            Billing
          </Link>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{session.user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
            </div>
          </div>
          <LogoutButton
            variant="ghost"
            className="w-full justify-start mt-2 rounded-md hover:bg-destructive/10 hover:text-destructive text-sm font-medium text-muted-foreground transition-colors"
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 border-b bg-background flex items-center px-4 md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="font-bold tracking-tight">QuickInvoice</span>
          </Link>
        </header>
        
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
