import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { BarChart3, IndianRupee, AlertTriangle, PieChart } from "lucide-react";

export default async function ReportsPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const reports = [
    {
      title: "Collection Summary",
      description: "Payment collections by method and period",
      href: "/reports/collection",
      icon: IndianRupee,
      color: "text-green-600",
    },
    {
      title: "Outstanding Report",
      description: "Unit-wise billed, paid, and outstanding amounts",
      href: "/reports/outstanding",
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      title: "Income & Expense",
      description: "Income vs expense statement from ledger entries",
      href: "/reports/income-expense",
      icon: BarChart3,
      color: "text-blue-600",
    },
    {
      title: "Fund Position",
      description: "Balance sheet: assets, liabilities, and equity",
      href: "/reports/fund-position",
      icon: PieChart,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          Financial reports derived from double-entry ledger
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((r) => (
          <Link key={r.href} href={r.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center gap-4">
                <r.icon className={`h-8 w-8 ${r.color}`} />
                <div>
                  <CardTitle className="text-base">{r.title}</CardTitle>
                  <CardDescription>{r.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
