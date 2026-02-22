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
import { createSociety } from "@/services/society.service";

export default function SocietySetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      await createSociety({
        name: formData.get("name") as string,
        address: formData.get("address") as string,
        city: formData.get("city") as string,
        state: formData.get("state") as string,
        pincode: formData.get("pincode") as string,
        phone: (formData.get("phone") as string) || undefined,
        email: (formData.get("email") as string) || undefined,
        registrationNumber:
          (formData.get("registrationNumber") as string) || undefined,
        gstNumber: (formData.get("gstNumber") as string) || undefined,
        panNumber: (formData.get("panNumber") as string) || undefined,
        billingDueDay: Number(formData.get("billingDueDay")) || 10,
      });
      router.push("/society/blocks");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create society");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Society Setup</h1>
        <p className="text-muted-foreground">
          Register your society to start managing operations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Society Details</CardTitle>
          <CardDescription>
            Enter basic information about your society
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Society Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Sunrise Heights CHS Ltd."
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Plot 15, Sector 7, Kharghar"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Navi Mumbai"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="Maharashtra"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  placeholder="410210"
                  maxLength={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 22 2770 1234"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="secretary@sunriseheights.in"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration No.</Label>
                <Input
                  id="registrationNumber"
                  name="registrationNumber"
                  placeholder="MH/123/2020"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="panNumber">PAN Number</Label>
                <Input
                  id="panNumber"
                  name="panNumber"
                  placeholder="AABCS1234A"
                  maxLength={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  name="gstNumber"
                  placeholder="27AABCS1234A1Z5"
                  maxLength={15}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingDueDay">Billing Due Day</Label>
                <Input
                  id="billingDueDay"
                  name="billingDueDay"
                  type="number"
                  min={1}
                  max={28}
                  defaultValue={10}
                  placeholder="10"
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Society & Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
