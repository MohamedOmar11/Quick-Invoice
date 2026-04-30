import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="h-16 px-4 md:px-6 flex items-center justify-between max-w-6xl mx-auto">
          <div className="font-semibold">Admin</div>
          <nav className="flex items-center gap-4 text-sm">
            <Link className="text-muted-foreground hover:text-foreground" href="/admin/pricing">
              Pricing
            </Link>
            <Link className="text-muted-foreground hover:text-foreground" href="/admin/payments">
              Payments
            </Link>
            <Link className="text-muted-foreground hover:text-foreground" href="/admin/promo-codes">
              Promo Codes
            </Link>
            <Link className="text-muted-foreground hover:text-foreground" href="/dashboard">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main className="p-6 md:p-8 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}

