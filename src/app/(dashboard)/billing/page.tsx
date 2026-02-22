import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getBillingStats } from "@/services/billing.service";
import { formatINR } from "@/lib/utils/currency";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Receipt, IndianRupee, AlertTriangle, CheckCircle } from "lucide-react";

export default async function BillingPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const stats = await getBillingStats(session.societyId);

  const statCards = [
    {
      title: "Total Invoices",
      value: stats.totalInvoices.toString(),
      icon: Receipt,
      color: "text-blue-600",
    },
    {
      title: "Total Billed",
      value: formatINR(stats.totalBilled),
      icon: IndianRupee,
      color: "text-purple-600",
    },
    {
      title: "Total Collected",
      value: formatINR(stats.totalPaid),
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Outstanding",
      value: formatINR(stats.totalOutstanding),
      icon: AlertTriangle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Billing</h1>
          <p className="text-muted-foreground">
            Generate and manage monthly invoices
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/society/fee-structure">
            <Button variant="outline">Fee Structure</Button>
          </Link>
          <Link href="/billing/generate">
            <Button>Generate Invoices</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/billing/generate">
            <Button variant="outline">Generate Monthly Bills</Button>
          </Link>
          <Link href="/billing/invoices">
            <Button variant="outline">View All Invoices</Button>
          </Link>
          <Link href="/society/fee-structure">
            <Button variant="outline">Manage Charges</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
