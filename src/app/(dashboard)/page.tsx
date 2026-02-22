import { getSession } from "@/lib/auth/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Users, Receipt, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();

  const cards = [
    {
      title: "Society Setup",
      description: "Configure your society, blocks, and units",
      icon: Building2,
      href: "/society/setup",
      color: "text-blue-600",
    },
    {
      title: "Members",
      description: "Manage residents and owners",
      icon: Users,
      href: "/members",
      color: "text-green-600",
    },
    {
      title: "Billing",
      description: "Generate and manage invoices",
      icon: Receipt,
      href: "/billing",
      color: "text-purple-600",
    },
    {
      title: "Defaulters",
      description: "Track outstanding payments",
      icon: AlertTriangle,
      href: "/defaulters",
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {session?.name}</h1>
        <p className="text-muted-foreground">
          {session?.societyId
            ? "Here's an overview of your society"
            : "Get started by setting up your society"}
        </p>
      </div>

      {!session?.societyId && (
        <Card className="border-dashed border-2">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              You haven&apos;t set up a society yet. Create one to start
              managing your residential community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/society/setup"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Building2 className="h-4 w-4" />
              Create Society
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
