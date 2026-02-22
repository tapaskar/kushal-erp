"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Phone, Mail, Home, Calendar } from "lucide-react";
import { deactivateMember } from "@/services/member.service";
import Link from "next/link";

interface MemberData {
  member: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    memberType: string;
    validFrom: string;
    validTo: string | null;
    isActive: boolean;
  };
  unit: { unitNumber: string };
  block: { name: string };
}

export function MemberDetailClient({ data }: { data: MemberData }) {
  const router = useRouter();
  const { member, unit, block } = data;

  async function handleDeactivate() {
    if (!confirm(`Deactivate ${member.name}? This will mark them as moved out.`))
      return;
    await deactivateMember(member.id);
    router.push("/members");
    router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/members">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{member.name}</h1>
          <p className="text-muted-foreground">
            {unit.unitNumber}, {block.name}
          </p>
        </div>
        <Badge
          variant={member.isActive ? "default" : "secondary"}
          className="text-sm"
        >
          {member.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{member.phone}</span>
          </div>
          {member.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{member.email}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Home className="h-4 w-4 text-muted-foreground" />
            <span>
              {unit.unitNumber}, {block.name} —{" "}
              <span className="capitalize">
                {member.memberType.replace("_", " ")}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              From {member.validFrom}
              {member.validTo ? ` to ${member.validTo}` : " (ongoing)"}
            </span>
          </div>
        </CardContent>
      </Card>

      {member.isActive && (
        <div className="flex justify-end">
          <Button variant="destructive" onClick={handleDeactivate}>
            Deactivate Member
          </Button>
        </div>
      )}
    </div>
  );
}
