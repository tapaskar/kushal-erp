"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS } from "@/lib/constants";
import { LayoutDashboard, Building2, Users } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Building2,
  Users,
};

export function AdminSidebar({ mobile }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className={
        mobile
          ? "flex flex-col w-full h-full bg-sidebar"
          : "hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-sidebar"
      }
    >
      {/* Brand */}
      <div className="flex h-16 items-center px-5 border-b border-sidebar-border shrink-0">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary/15 shrink-0">
            <Logo className="h-5 w-5 text-sidebar-primary" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sidebar-foreground font-bold text-sm tracking-tight">
              Kushal-RWA
            </span>
            <span className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest font-medium">
              Platform Admin
            </span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-sidebar-primary" : "text-sidebar-foreground/45"
                  )}
                />
              )}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-sidebar-border shrink-0">
        <p className="text-[10px] text-sidebar-foreground/25 text-center tracking-widest uppercase">
          Kushal-RWA · v2.0
        </p>
      </div>
    </aside>
  );
}
