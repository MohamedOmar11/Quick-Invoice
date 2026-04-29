"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Home, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Invoices", icon: LayoutDashboard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard" || pathname.startsWith("/dashboard/invoice")
            : pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
            )}
          >
            <span
              className={cn(
                "absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full transition-opacity",
                active ? "bg-sidebar-primary opacity-100" : "opacity-0"
              )}
            />
            <Icon className={cn("h-4 w-4", active ? "text-sidebar-foreground" : "text-sidebar-foreground/60")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

