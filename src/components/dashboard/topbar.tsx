"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus } from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { LogoutButton } from "@/components/auth/logout-button";
import Image from "next/image";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function getTitle(pathname: string) {
  if (pathname.startsWith("/dashboard/invoice/new")) return "New invoice";
  if (pathname.startsWith("/dashboard/invoice/")) return "Invoice";
  if (pathname.startsWith("/dashboard/settings")) return "Settings";
  if (pathname.startsWith("/dashboard/billing")) return "Billing";
  if (pathname.startsWith("/dashboard")) return "Invoices";
  return "Dashboard";
}

export function Topbar({
  user,
}: {
  user: { name?: string | null; email?: string | null };
}) {
  const pathname = usePathname();
  const title = getTitle(pathname);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const initials = (user.name || user.email || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log out?</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">Are you sure you want to log out?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutOpen(false)} disabled={logoutLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={logoutLoading}
              onClick={async () => {
                setLogoutLoading(true);
                await signOut({ callbackUrl: "/" });
              }}
            >
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="h-20 px-4 md:px-6 flex items-center gap-3">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Open menu">
                  <Menu className="h-4 w-4" />
                </Button>
              }
            />
            <SheetContent side="left" className="p-4">
              <div className="mb-4">
                <Image src="/hesaby-logo.png" alt="Hesaby" width={405} height={108} className="h-16 w-auto" priority />
              </div>
              <SidebarNav />
              <div className="mt-6 border-t pt-4">
                <div className="text-sm font-medium truncate">{user.name || "User"}</div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                <LogoutButton
                  variant="ghost"
                  className="mt-3 w-full justify-start rounded-lg hover:bg-destructive/10 hover:text-destructive text-sm font-medium text-muted-foreground"
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-lg font-semibold tracking-tight truncate">{title}</div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild className="rounded-full hidden sm:inline-flex">
            <Link href="/dashboard/invoice/new">
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Link>
          </Button>
          <Button asChild size="icon" className="rounded-full sm:hidden">
            <Link href="/dashboard/invoice/new" aria-label="Create invoice">
              <Plus className="h-4 w-4" />
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="icon" className="rounded-full">
                  <span className="text-xs font-semibold">{initials}</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <div className="text-sm font-medium truncate">{user.name || "User"}</div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              </div>
              <DropdownMenuItem>
                <Link href="/dashboard/settings" className="w-full">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/dashboard/billing" className="w-full">
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                onClick={() => setLogoutOpen(true)}
                onSelect={() => setLogoutOpen(true)}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
