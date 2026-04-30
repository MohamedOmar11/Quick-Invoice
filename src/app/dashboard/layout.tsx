import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Topbar } from "@/components/dashboard/topbar";
import Image from "next/image";

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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-sidebar hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/hesaby-logo.png" alt="Hesaby" width={270} height={72} className="h-12 w-auto" priority />
          </Link>
        </div>

        <div className="flex-1 px-3 py-5">
          <SidebarNav />
        </div>

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
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={{ name: session.user?.name, email: session.user?.email }} />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
