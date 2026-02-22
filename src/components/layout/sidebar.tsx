"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import {
  LayoutDashboard,
  Building2,
  Users,
  Receipt,
  CreditCard,
  AlertTriangle,
  Package,
  Bell,
  MessageSquare,
  BarChart3,
  Store,
  ShoppingCart,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Building2,
  Users,
  Receipt,
  CreditCard,
  AlertTriangle,
  Package,
  Bell,
  MessageSquare,
  BarChart3,
  Store,
  ShoppingCart,
};

export function Sidebar({ mobile }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <aside className={mobile
      ? "flex flex-col w-full h-full border-r bg-card"
      : "hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 border-r bg-card"
    }>
      <div className="flex h-14 items-center px-4 border-b">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Logo className="h-6 w-6 text-primary" />
          Kushal-RWA
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
