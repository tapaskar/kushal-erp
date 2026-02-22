import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSociety } from "@/services/society.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Building2, Layers, Home, IndianRupee } from "lucide-react";

export default async function SocietyPage() {
  const session = await getSession();

  if (!session?.societyId) {
    redirect("/society/setup");
  }

  const society = await getSociety(session.societyId);
  if (!society) redirect("/society/setup");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{society.name}</h1>
        <p className="text-muted-foreground">
          {society.address}, {society.city} — {society.pincode}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/society/setup">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-3">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-sm">Society Details</CardTitle>
                <CardDescription>Edit basic info</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/society/blocks">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-3">
              <Layers className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-sm">Blocks & Wings</CardTitle>
                <CardDescription>Manage towers</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/society/units">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-3">
              <Home className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-sm">Units / Flats</CardTitle>
                <CardDescription>Manage units</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/society/fee-structure">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-3">
              <IndianRupee className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-sm">Fee Structure</CardTitle>
                <CardDescription>Manage charges</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Society Info</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Registration No.</dt>
              <dd className="font-medium">
                {society.registrationNumber || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">PAN</dt>
              <dd className="font-medium">{society.panNumber || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">GST</dt>
              <dd className="font-medium">{society.gstNumber || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Billing Due Day</dt>
              <dd className="font-medium">
                {society.billingDueDay}th of every month
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="font-medium">{society.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{society.email || "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
