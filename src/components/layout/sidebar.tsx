"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, STAFF_SUB_NAV } from "@/lib/constants";
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
  UserCog,
  Sparkles,
  ChevronDown,
  Clock,
  ClipboardList,
  Shield,
  Radio,
  DoorOpen,
  Siren,
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
  UserCog,
  Sparkles,
  Clock,
  ClipboardList,
  Shield,
  Radio,
  DoorOpen,
  Siren,
};

export function Sidebar({ mobile }: { mobile?: boolean }) {
  const pathname = usePathname();
  const isStaffSection = pathname.startsWith("/staff");
  const [staffOpen, setStaffOpen] = useState(isStaffSection);

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
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary/15 shrink-0">
            <Logo className="h-5 w-5 text-sidebar-primary" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sidebar-foreground font-bold text-sm tracking-tight">
              Kushal-RWA
            </span>
            <span className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest font-medium">
              Society ERP
            </span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];

          // Staff item gets a collapsible sub-menu
          if (item.href === "/staff") {
            return (
              <div key={item.href}>
                <button
                  onClick={() => setStaffOpen((o) => !o)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isStaffSection
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  {Icon && (
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isStaffSection
                          ? "text-sidebar-primary"
                          : "text-sidebar-foreground/45"
                      )}
                    />
                  )}
                  {item.label}
                  <ChevronDown
                    className={cn(
                      "ml-auto h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                      isStaffSection
                        ? "text-sidebar-foreground/50"
                        : "text-sidebar-foreground/30",
                      staffOpen && "rotate-180"
                    )}
                  />
                </button>

                {staffOpen && (
                  <div className="mt-0.5 ml-3 border-l border-sidebar-border pl-2 space-y-0.5">
                    {STAFF_SUB_NAV.map((sub) => {
                      const SubIcon = iconMap[sub.icon];
                      const subActive =
                        sub.href === "/staff"
                          ? pathname === "/staff"
                          : pathname.startsWith(sub.href);

                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={cn(
                            "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-150",
                            subActive
                              ? "bg-sidebar-accent/70 text-sidebar-accent-foreground"
                              : "text-sidebar-foreground/50 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground/80"
                          )}
                        >
                          {SubIcon && (
                            <SubIcon
                              className={cn(
                                "h-3.5 w-3.5 shrink-0",
                                subActive
                                  ? "text-sidebar-primary"
                                  : "text-sidebar-foreground/35"
                              )}
                            />
                          )}
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive =
            item.href === "/"
              ? pathname === "/"
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
