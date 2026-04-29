import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Users, FileText, CreditCard, ShieldAlert, Gift, SlidersHorizontal } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-destructive flex items-center justify-center">
              <ShieldAlert className="text-destructive-foreground w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">Admin Panel</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium">
            <Users className="w-4 h-4 text-muted-foreground" />
            Users
          </Link>
          <Link href="/admin/app-settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            App Settings
          </Link>
          <Link href="/admin/payments" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            Payments
          </Link>
          <Link href="/admin/promo-codes" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium">
            <Gift className="w-4 h-4 text-muted-foreground" />
            Promo Codes
          </Link>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{session.user?.name || "Admin"}</p>
            </div>
          </div>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 mt-2 rounded-md hover:bg-primary/10 text-sm font-medium transition-colors">
            <FileText className="w-4 h-4" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
