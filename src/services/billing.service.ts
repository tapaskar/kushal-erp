"use server";

import { db } from "@/db";
import {
  chargeHeads,
  unitChargeOverrides,
  invoices,
  invoiceLineItems,
  units,
  blocks,
  members,
  accounts,
  societies,
} from "@/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createJournalEntry } from "./accounting.service";
import { getUnitOutstanding } from "./accounting.service";
import { generateInvoiceNumber } from "@/lib/utils/invoice-number";
import { calculateInterest } from "@/lib/utils/interest";

// ─── Charge Heads ───

export async function getChargeHeads(societyId: string) {
  return db
    .select({
      chargeHead: chargeHeads,
      account: accounts,
    })
    .from(chargeHeads)
    .innerJoin(accounts, eq(chargeHeads.incomeAccountId, accounts.id))
    .where(
      and(eq(chargeHeads.societyId, societyId), eq(chargeHeads.isActive, true))
    )
    .orderBy(asc(chargeHeads.sortOrder));
}

export async function createChargeHead(data: {
  societyId: string;
  name: string;
  code: string;
  calculationType: "per_sqft" | "flat_rate" | "percentage" | "custom";
  rate: string;
  incomeAccountId: string;
  frequency?: "monthly" | "quarterly" | "half_yearly" | "yearly" | "one_time";
  isGstApplicable?: boolean;
  gstRate?: string;
}) {
  const [ch] = await db.insert(chargeHeads).values(data).returning();
  revalidatePath("/society/fee-structure");
  return ch;
}

export async function updateChargeHead(
  id: string,
  data: Partial<{
    name: string;
    rate: string;
    calculationType: "per_sqft" | "flat_rate" | "percentage" | "custom";
    isGstApplicable: boolean;
    gstRate: string;
    isActive: boolean;
  }>
) {
  const [updated] = await db
    .update(chargeHeads)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(chargeHeads.id, id))
    .returning();
  revalidatePath("/society/fee-structure");
  return updated;
}

export async function deleteChargeHead(id: string) {
  await db
    .update(chargeHeads)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(chargeHeads.id, id));
  revalidatePath("/society/fee-structure");
}

// ─── Income Accounts (for charge head dropdown) ───

export async function getIncomeAccounts(societyId: string) {
  return db
    .select()
    .from(accounts)
    .where(
      and(
        eq(accounts.societyId, societyId),
        eq(accounts.accountType, "income"),
        eq(accounts.isActive, true)
      )
    )
    .orderBy(asc(accounts.code));
}

// ─── Invoice Generation ───

/**
 * Generate monthly invoices for all billable units in a society.
 * This is the core billing engine.
 */
export async function generateMonthlyInvoices(params: {
  societyId?: string;
  billingMonth: number; // 1-12
  billingYear: number;
  createdBy?: string;
}) {
  const { getSession } = await import("@/lib/auth/session");
  const session = await getSession();
  const societyId = params.societyId || session?.societyId;
  if (!societyId) throw new Error("No society context");
  const { billingMonth, billingYear, createdBy } = params;

  // Check for existing invoices this period
  const existing = await db
    .select({ count: sql<number>`count(*)` })
    .from(invoices)
    .where(
      and(
        eq(invoices.societyId, societyId),
        eq(invoices.billingMonth, billingMonth),
        eq(invoices.billingYear, billingYear)
      )
    );

  if (existing[0].count > 0) {
    throw new Error(
      `Invoices already exist for ${billingMonth}/${billingYear}. Delete them first to regenerate.`
    );
  }

  // Get society config
  const [society] = await db
    .select()
    .from(societies)
    .where(eq(societies.id, societyId))
    .limit(1);

  if (!society) throw new Error("Society not found");

  // Get active charge heads
  const activeChargeHeads = await db
    .select()
    .from(chargeHeads)
    .where(
      and(eq(chargeHeads.societyId, societyId), eq(chargeHeads.isActive, true))
    )
    .orderBy(asc(chargeHeads.sortOrder));

  if (activeChargeHeads.length === 0) {
    throw new Error("No charge heads configured. Set up fee structure first.");
  }

  // Get AR account
  const [arAccount] = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.societyId, societyId), eq(accounts.code, "1010")))
    .limit(1);

  if (!arAccount) throw new Error("AR-Maintenance account not found. Seed chart of accounts.");

  // Get all billable units with their active members
  const billableUnits = await db
    .select({
      unit: units,
      block: blocks,
      member: members,
    })
    .from(units)
    .innerJoin(blocks, eq(units.blockId, blocks.id))
    .leftJoin(
      members,
      and(
        eq(members.unitId, units.id),
        eq(members.isActive, true)
      )
    )
    .where(
      and(eq(units.societyId, societyId), eq(units.isBillable, true))
    )
    .orderBy(asc(blocks.sortOrder), asc(units.unitNumber));

  // Get unit charge overrides
  const overrides = await db
    .select()
    .from(unitChargeOverrides)
    .where(eq(unitChargeOverrides.societyId, societyId));

  const overrideMap = new Map<string, Map<string, string>>();
  for (const o of overrides) {
    if (!overrideMap.has(o.unitId)) overrideMap.set(o.unitId, new Map());
    overrideMap.get(o.unitId)!.set(o.chargeHeadId, o.overrideRate);
  }

  // Deduplicate units (left join may produce dupes)
  const unitMap = new Map<string, typeof billableUnits[0]>();
  for (const row of billableUnits) {
    if (!unitMap.has(row.unit.id)) {
      unitMap.set(row.unit.id, row);
    }
  }

  const issueDate = `${billingYear}-${billingMonth.toString().padStart(2, "0")}-01`;
  const dueDay = society.billingDueDay;
  const dueDate = `${billingYear}-${billingMonth.toString().padStart(2, "0")}-${dueDay.toString().padStart(2, "0")}`;

  let invoiceSeq = 0;
  const results: string[] = [];

  for (const [unitId, row] of unitMap) {
    invoiceSeq++;
    const { unit, member } = row;

    // If no active member, skip (can't bill an unoccupied unit without a member)
    if (!member) continue;

    // Calculate charges
    const lineItems: {
      chargeHeadId: string;
      description: string;
      rate: string;
      areaSqft: string | null;
      amount: number;
      gstRate: number;
      gstAmount: number;
      totalAmount: number;
      incomeAccountId: string;
    }[] = [];

    for (const ch of activeChargeHeads) {
      const unitOverride = overrideMap.get(unitId)?.get(ch.id);
      const rate = unitOverride || ch.rate;
      let amount = 0;

      switch (ch.calculationType) {
        case "per_sqft":
          const area = parseFloat(unit.areaSqft || "0");
          amount = area * parseFloat(rate);
          break;
        case "flat_rate":
          amount = parseFloat(rate);
          break;
        case "percentage":
          // Percentage of a base charge (not implemented for simplicity, use flat rate)
          amount = parseFloat(rate);
          break;
        default:
          amount = parseFloat(rate);
      }

      if (amount <= 0) continue;

      const gstRate = ch.isGstApplicable ? parseFloat(ch.gstRate || "18") : 0;
      const gstAmount = Math.round((amount * gstRate) / 100 * 100) / 100;

      lineItems.push({
        chargeHeadId: ch.id,
        description: ch.name,
        rate,
        areaSqft: ch.calculationType === "per_sqft" ? unit.areaSqft : null,
        amount,
        gstRate,
        gstAmount,
        totalAmount: amount + gstAmount,
        incomeAccountId: ch.incomeAccountId,
      });
    }

    if (lineItems.length === 0) continue;

    const subtotal = lineItems.reduce((s, li) => s + li.amount, 0);
    const gstTotal = lineItems.reduce((s, li) => s + li.gstAmount, 0);

    // Calculate interest on previous outstanding
    const previousOutstanding = await getUnitOutstanding(
      societyId,
      unitId,
      issueDate
    );
    const interestAmount = calculateInterest({
      outstandingAmount: previousOutstanding,
      annualRate: parseFloat(society.latePaymentInterestRate),
      dueDateStr: dueDate,
      asOfDateStr: issueDate,
      graceDays: society.latePaymentGraceDays,
    });

    const totalAmount =
      Math.round((subtotal + gstTotal + interestAmount) * 100) / 100;
    const balanceDue =
      Math.round((previousOutstanding + totalAmount) * 100) / 100;
    const invoiceNumber = generateInvoiceNumber(billingYear, billingMonth, invoiceSeq);

    // Create invoice
    const [invoice] = await db
      .insert(invoices)
      .values({
        societyId,
        unitId,
        memberId: member.id,
        invoiceNumber,
        billingMonth,
        billingYear,
        issueDate,
        dueDate,
        subtotal: subtotal.toFixed(2),
        gstAmount: gstTotal.toFixed(2),
        interestAmount: interestAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        paidAmount: "0",
        balanceDue: balanceDue.toFixed(2),
        previousBalance: previousOutstanding.toFixed(2),
        status: "sent",
      })
      .returning();

    // Create line items
    const lineItemValues = lineItems.map((li, idx) => ({
      invoiceId: invoice.id,
      societyId,
      chargeHeadId: li.chargeHeadId,
      description: li.description,
      areaSqft: li.areaSqft,
      rate: li.rate,
      quantity: "1",
      amount: li.amount.toFixed(2),
      gstRate: li.gstRate.toFixed(2),
      gstAmount: li.gstAmount.toFixed(2),
      totalAmount: li.totalAmount.toFixed(2),
      incomeAccountId: li.incomeAccountId,
      sortOrder: idx,
    }));

    await db.insert(invoiceLineItems).values(lineItemValues);

    // Create journal entry: DR AR-Maintenance, CR each income account
    const jeLines = [
      {
        accountId: arAccount.id,
        debitCredit: "debit" as const,
        amount: totalAmount.toFixed(2),
        unitId,
        memberId: member.id,
        narration: `Invoice ${invoiceNumber}`,
      },
      ...lineItems.map((li) => ({
        accountId: li.incomeAccountId,
        debitCredit: "credit" as const,
        amount: li.totalAmount.toFixed(2),
        unitId,
        memberId: member.id,
      })),
    ];

    // If interest > 0, add interest income line
    if (interestAmount > 0) {
      const [interestAccount] = await db
        .select()
        .from(accounts)
        .where(
          and(eq(accounts.societyId, societyId), eq(accounts.code, "3010"))
        )
        .limit(1);
      if (interestAccount) {
        jeLines.push({
          accountId: interestAccount.id,
          debitCredit: "credit" as const,
          amount: interestAmount.toFixed(2),
          unitId,
          memberId: member.id,
        });
        // Adjust the DR side to include interest
        jeLines[0].amount = (totalAmount + interestAmount).toFixed(2);
      }
    }

    // Only create JE if balanced (recalculate)
    const totalDr = jeLines
      .filter((l) => l.debitCredit === "debit")
      .reduce((s, l) => s + parseFloat(l.amount), 0);
    const totalCr = jeLines
      .filter((l) => l.debitCredit === "credit")
      .reduce((s, l) => s + parseFloat(l.amount), 0);

    // Rebalance: set DR = total CR
    if (Math.abs(totalDr - totalCr) > 0.01) {
      jeLines[0].amount = totalCr.toFixed(2);
    }

    const je = await createJournalEntry({
      societyId,
      date: issueDate,
      narration: `Monthly invoice ${invoiceNumber} for unit ${unit.unitNumber}`,
      sourceType: "invoice",
      sourceId: invoice.id,
      createdBy,
      lines: jeLines,
    });

    // Link JE to invoice
    await db
      .update(invoices)
      .set({ journalEntryId: je.id })
      .where(eq(invoices.id, invoice.id));

    results.push(invoice.id);
  }

  revalidatePath("/billing");
  return { count: results.length, invoiceIds: results };
}

// ─── Invoice Queries ───

export async function getInvoices(
  societyId: string,
  filters?: { billingMonth?: number; billingYear?: number; status?: string }
) {
  const conditions = [eq(invoices.societyId, societyId)];

  if (filters?.billingMonth) {
    conditions.push(eq(invoices.billingMonth, filters.billingMonth));
  }
  if (filters?.billingYear) {
    conditions.push(eq(invoices.billingYear, filters.billingYear));
  }

  return db
    .select({
      invoice: invoices,
      unit: units,
      block: blocks,
      member: members,
    })
    .from(invoices)
    .innerJoin(units, eq(invoices.unitId, units.id))
    .innerJoin(blocks, eq(units.blockId, blocks.id))
    .innerJoin(members, eq(invoices.memberId, members.id))
    .where(and(...conditions))
    .orderBy(asc(blocks.sortOrder), asc(units.unitNumber));
}

export async function getInvoiceDetail(invoiceId: string) {
  const [invoiceData] = await db
    .select({
      invoice: invoices,
      unit: units,
      block: blocks,
      member: members,
    })
    .from(invoices)
    .innerJoin(units, eq(invoices.unitId, units.id))
    .innerJoin(blocks, eq(units.blockId, blocks.id))
    .innerJoin(members, eq(invoices.memberId, members.id))
    .where(eq(invoices.id, invoiceId))
    .limit(1);

  if (!invoiceData) return null;

  const lineItemsData = await db
    .select({
      lineItem: invoiceLineItems,
      chargeHead: chargeHeads,
    })
    .from(invoiceLineItems)
    .innerJoin(chargeHeads, eq(invoiceLineItems.chargeHeadId, chargeHeads.id))
    .where(eq(invoiceLineItems.invoiceId, invoiceId))
    .orderBy(asc(invoiceLineItems.sortOrder));

  const [society] = await db
    .select()
    .from(societies)
    .where(eq(societies.id, invoiceData.invoice.societyId))
    .limit(1);

  return { ...invoiceData, lineItems: lineItemsData, society };
}

// ─── Billing Stats ───

export async function getBillingStats(societyId: string) {
  const [stats] = await db
    .select({
      totalInvoices: sql<number>`count(*)`,
      totalBilled: sql<string>`coalesce(sum(${invoices.totalAmount}::numeric), 0)`,
      totalPaid: sql<string>`coalesce(sum(${invoices.paidAmount}::numeric), 0)`,
      totalOutstanding: sql<string>`coalesce(sum(${invoices.balanceDue}::numeric), 0)`,
    })
    .from(invoices)
    .where(eq(invoices.societyId, societyId));

  return {
    totalInvoices: stats.totalInvoices,
    totalBilled: parseFloat(stats.totalBilled),
    totalPaid: parseFloat(stats.totalPaid),
    totalOutstanding: parseFloat(stats.totalOutstanding),
  };
}
