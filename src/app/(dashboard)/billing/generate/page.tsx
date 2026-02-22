"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { generateMonthlyInvoices } from "@/services/billing.service";
import { getMonthName } from "@/lib/utils/invoice-number";

export default function GenerateInvoicesPage() {
  const router = useRouter();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ count: number } | null>(null);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await generateMonthlyInvoices({
        societyId: "", // Will be resolved from session on server
        billingMonth: month,
        billingYear: year,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Generate Invoices</h1>
        <p className="text-muted-foreground">
          Create monthly maintenance invoices for all billable units
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing Period</CardTitle>
          <CardDescription>
            Select month and year to generate invoices for
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                type="number"
                min={1}
                max={12}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                {getMonthName(month)}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                min={2020}
                max={2030}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {result && (
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
              Successfully generated {result.count} invoices for{" "}
              {getMonthName(month)} {year}.
              <div className="mt-2">
                <Button
                  variant="link"
                  className="h-auto p-0 text-green-800 underline"
                  onClick={() => router.push("/billing/invoices")}
                >
                  View Invoices
                </Button>
              </div>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            className="w-full"
            disabled={loading}
          >
            {loading
              ? "Generating..."
              : `Generate ${getMonthName(month)} ${year} Invoices`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
