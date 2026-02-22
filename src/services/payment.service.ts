"use server";

import { db } from "@/db";
import {
  payments,
  invoices,
  units,
  blocks,
  members,
  accounts,
} from "@/db/schema";
import { eq, and, asc, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createJournalEntry } from "./accounting.service";

// ─── Record Manual Payment ───

export async function recordManualPayment(data: {
  societyId: string;
  invoiceId: string;
  amount: string;
  paymentDate: string;
  paymentMethod: "cash" | "cheque" | "neft" | "upi" | "rtgs" | "demand_draft";
  instrumentNumber?: string;
  instrumentDate?: string;
  bankName?: string;
  transactionReference?: string;
  notes?: string;
  createdBy?: string;
}) {
  const { societyId, invoiceId } = data;

  // Get the invoice
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, invoiceId))
    .limit(1);

  if (!invoice) throw new Error("Invoice not found");

  const paymentAmount = parseFloat(data.amount);
  if (paymentAmount <= 0) throw new Error("Payment amount must be positive");

  // Get AR and Bank accounts
  const [arAccount] = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.societyId, societyId), eq(accounts.code, "1010")))
    .limit(1);

  const [bankAccount] = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.societyId, societyId), eq(accounts.code, "1001")))
    .limit(1);

  if (!arAccount || !bankAccount)
    throw new Error("AR or Bank account not found");

  // Generate receipt number: RCT-YYYYMMDD-XXXX
  const receiptNumber = await getNextReceiptNumber(societyId, data.paymentDate);

  // Create journal entry: DR Bank, CR AR-Maintenance
  const je = await createJournalEntry({
    societyId,
    date: data.paymentDate,
    narration: `Payment ${receiptNumber} for invoice ${invoice.invoiceNumber}`,
    sourceType: "payment",
    createdBy: data.createdBy,
    lines: [
      {
        accountId: bankAccount.id,
        debitCredit: "debit",
        amount: paymentAmount.toFixed(2),
        unitId: invoice.unitId,
        memberId: invoice.memberId,
      },
      {
        accountId: arAccount.id,
        debitCredit: "credit",
        amount: paymentAmount.toFixed(2),
        unitId: invoice.unitId,
        memberId: invoice.memberId,
      },
    ],
  });

  // Create payment record
  const [payment] = await db
    .insert(payments)
    .values({
      societyId,
      invoiceId,
      unitId: invoice.unitId,
      memberId: invoice.memberId,
      receiptNumber,
      amount: paymentAmount.toFixed(2),
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod,
      status: "captured",
      instrumentNumber: data.instrumentNumber,
      instrumentDate: data.instrumentDate,
      bankName: data.bankName,
      transactionReference: data.transactionReference,
      journalEntryId: je.id,
      notes: data.notes,
    })
    .returning();

  // Update source on JE
  await db.execute(
    sql`UPDATE journal_entries SET source_id = ${payment.id} WHERE id = ${je.id}`
  );

  // Update invoice: add to paidAmount, reduce balanceDue, update status
  const newPaidAmount =
    parseFloat(invoice.paidAmount) + paymentAmount;
  const newBalanceDue =
    parseFloat(invoice.balanceDue) - paymentAmount;

  let newStatus = invoice.status;
  if (newBalanceDue <= 0.01) {
    newStatus = "paid";
  } else if (newPaidAmount > 0) {
    newStatus = "partially_paid";
  }

  await db
    .update(invoices)
    .set({
      paidAmount: newPaidAmount.toFixed(2),
      balanceDue: Math.max(0, newBalanceDue).toFixed(2),
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId));

  revalidatePath("/payments");
  revalidatePath("/billing");
  return payment;
}

async function getNextReceiptNumber(
  societyId: string,
  date: string
): Promise<string> {
  const ymd = date.replace(/-/g, "").slice(0, 8);
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(payments)
    .where(
      and(
        eq(payments.societyId, societyId),
        eq(payments.paymentDate, date)
      )
    );
  const seq = (result.count + 1).toString().padStart(4, "0");
  return `RCT-${ymd}-${seq}`;
}

// ─── Payment Queries ───

export async function getPayments(societyId: string) {
  return db
    .select({
      payment: payments,
      invoice: invoices,
      unit: units,
      block: blocks,
      member: members,
    })
    .from(payments)
    .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
    .innerJoin(units, eq(payments.unitId, units.id))
    .innerJoin(blocks, eq(units.blockId, blocks.id))
    .innerJoin(members, eq(payments.memberId, members.id))
    .where(eq(payments.societyId, societyId))
    .orderBy(desc(payments.paymentDate), desc(payments.createdAt));
}

export async function getPayment(paymentId: string) {
  const [result] = await db
    .select({
      payment: payments,
      invoice: invoices,
      unit: units,
      block: blocks,
      member: members,
    })
    .from(payments)
    .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
    .innerJoin(units, eq(payments.unitId, units.id))
    .innerJoin(blocks, eq(units.blockId, blocks.id))
    .innerJoin(members, eq(payments.memberId, members.id))
    .where(eq(payments.id, paymentId))
    .limit(1);
  return result;
}

export async function getPaymentStats(societyId: string) {
  const [stats] = await db
    .select({
      totalPayments: sql<number>`count(*)`,
      totalCollected: sql<string>`coalesce(sum(${payments.amount}::numeric), 0)`,
      cashCount: sql<number>`count(*) filter (where ${payments.paymentMethod} = 'cash')`,
      onlineCount: sql<number>`count(*) filter (where ${payments.paymentMethod} in ('razorpay', 'upi', 'neft', 'rtgs'))`,
    })
    .from(payments)
    .where(
      and(eq(payments.societyId, societyId), eq(payments.status, "captured"))
    );

  return {
    totalPayments: stats.totalPayments,
    totalCollected: parseFloat(stats.totalCollected),
    cashCount: stats.cashCount,
    onlineCount: stats.onlineCount,
  };
}

// ─── Unpaid Invoices (for payment recording) ───

export async function getUnpaidInvoices(societyId: string) {
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
    .where(
      and(
        eq(invoices.societyId, societyId),
        sql`${invoices.balanceDue}::numeric > 0`
      )
    )
    .orderBy(asc(blocks.sortOrder), asc(units.unitNumber));
}
