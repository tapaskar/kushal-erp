"use server";

import { db } from "@/db";
import {
  invoices,
  units,
  blocks,
  members,
} from "@/db/schema";
import { eq, and, sql, asc } from "drizzle-orm";

interface DefaulterRow {
  unitId: string;
  unitNumber: string;
  blockName: string;
  memberName: string;
  memberPhone: string;
  totalOutstanding: number;
  oldestDueDate: string;
  invoiceCount: number;
}

export async function getDefaulters(societyId: string): Promise<DefaulterRow[]> {
  const rows = await db
    .select({
      unitId: invoices.unitId,
      unitNumber: units.unitNumber,
      blockName: blocks.name,
      memberName: members.name,
      memberPhone: members.phone,
      totalOutstanding: sql<string>`sum(${invoices.balanceDue}::numeric)`,
      oldestDueDate: sql<string>`min(${invoices.dueDate})`,
      invoiceCount: sql<number>`count(*)`,
    })
    .from(invoices)
    .innerJoin(units, eq(invoices.unitId, units.id))
    .innerJoin(blocks, eq(units.blockId, blocks.id))
    .innerJoin(members, eq(invoices.memberId, members.id))
    .where(
      and(
        eq(invoices.societyId, societyId),
        sql`${invoices.balanceDue}::numeric > 0`
      )
    )
    .groupBy(
      invoices.unitId,
      units.unitNumber,
      blocks.name,
      blocks.sortOrder,
      members.name,
      members.phone
    )
    .orderBy(sql`sum(${invoices.balanceDue}::numeric) desc`);

  return rows.map((r) => ({
    ...r,
    totalOutstanding: parseFloat(r.totalOutstanding),
  }));
}

export interface AgingBucket {
  label: string;
  count: number;
  amount: number;
}

export async function getAgingReport(societyId: string): Promise<AgingBucket[]> {
  const today = new Date().toISOString().split("T")[0];

  const [result] = await db
    .select({
      current_count: sql<number>`count(*) filter (where ${invoices.dueDate} >= ${today}::date)`,
      current_amt: sql<string>`coalesce(sum(${invoices.balanceDue}::numeric) filter (where ${invoices.dueDate} >= ${today}::date), 0)`,
      d30_count: sql<number>`count(*) filter (where ${invoices.dueDate} < ${today}::date and ${invoices.dueDate} >= (${today}::date - 30))`,
      d30_amt: sql<string>`coalesce(sum(${invoices.balanceDue}::numeric) filter (where ${invoices.dueDate} < ${today}::date and ${invoices.dueDate} >= (${today}::date - 30)), 0)`,
      d60_count: sql<number>`count(*) filter (where ${invoices.dueDate} < (${today}::date - 30) and ${invoices.dueDate} >= (${today}::date - 60))`,
      d60_amt: sql<string>`coalesce(sum(${invoices.balanceDue}::numeric) filter (where ${invoices.dueDate} < (${today}::date - 30) and ${invoices.dueDate} >= (${today}::date - 60)), 0)`,
      d90_count: sql<number>`count(*) filter (where ${invoices.dueDate} < (${today}::date - 60) and ${invoices.dueDate} >= (${today}::date - 90))`,
      d90_amt: sql<string>`coalesce(sum(${invoices.balanceDue}::numeric) filter (where ${invoices.dueDate} < (${today}::date - 60) and ${invoices.dueDate} >= (${today}::date - 90)), 0)`,
      d90plus_count: sql<number>`count(*) filter (where ${invoices.dueDate} < (${today}::date - 90))`,
      d90plus_amt: sql<string>`coalesce(sum(${invoices.balanceDue}::numeric) filter (where ${invoices.dueDate} < (${today}::date - 90)), 0)`,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.societyId, societyId),
        sql`${invoices.balanceDue}::numeric > 0`
      )
    );

  return [
    { label: "Current", count: result.current_count, amount: parseFloat(result.current_amt) },
    { label: "1-30 days", count: result.d30_count, amount: parseFloat(result.d30_amt) },
    { label: "31-60 days", count: result.d60_count, amount: parseFloat(result.d60_amt) },
    { label: "61-90 days", count: result.d90_count, amount: parseFloat(result.d90_amt) },
    { label: "90+ days", count: result.d90plus_count, amount: parseFloat(result.d90plus_amt) },
  ];
}
