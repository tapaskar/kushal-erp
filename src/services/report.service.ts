"use server";

import { db } from "@/db";
import {
  ledgerEntries,
  accounts,
  invoices,
  payments,
  units,
  blocks,
  members,
} from "@/db/schema";
import { eq, and, sql, gte, lte, asc } from "drizzle-orm";

// ─── Collection Summary ───

export async function getCollectionSummary(
  societyId: string,
  fromDate: string,
  toDate: string
) {
  const result = await db
    .select({
      paymentMethod: payments.paymentMethod,
      count: sql<number>`count(*)`,
      total: sql<string>`coalesce(sum(${payments.amount}::numeric), 0)`,
    })
    .from(payments)
    .where(
      and(
        eq(payments.societyId, societyId),
        eq(payments.status, "captured"),
        gte(payments.paymentDate, fromDate),
        lte(payments.paymentDate, toDate)
      )
    )
    .groupBy(payments.paymentMethod);

  const grandTotal = result.reduce((s, r) => s + parseFloat(r.total), 0);

  return {
    byMethod: result.map((r) => ({
      method: r.paymentMethod,
      count: r.count,
      total: parseFloat(r.total),
    })),
    grandTotal,
  };
}

// ─── Outstanding Report ───

export async function getOutstandingReport(societyId: string) {
  const result = await db
    .select({
      unitId: invoices.unitId,
      unitNumber: units.unitNumber,
      blockName: blocks.name,
      memberName: members.name,
      totalBilled: sql<string>`sum(${invoices.totalAmount}::numeric)`,
      totalPaid: sql<string>`sum(${invoices.paidAmount}::numeric)`,
      totalOutstanding: sql<string>`sum(${invoices.balanceDue}::numeric)`,
      invoiceCount: sql<number>`count(*)`,
    })
    .from(invoices)
    .innerJoin(units, eq(invoices.unitId, units.id))
    .innerJoin(blocks, eq(units.blockId, blocks.id))
    .innerJoin(members, eq(invoices.memberId, members.id))
    .where(eq(invoices.societyId, societyId))
    .groupBy(
      invoices.unitId,
      units.unitNumber,
      blocks.name,
      blocks.sortOrder,
      members.name
    )
    .orderBy(asc(blocks.sortOrder), asc(units.unitNumber));

  return result.map((r) => ({
    ...r,
    totalBilled: parseFloat(r.totalBilled),
    totalPaid: parseFloat(r.totalPaid),
    totalOutstanding: parseFloat(r.totalOutstanding),
  }));
}

// ─── Income & Expense Statement ───

export async function getIncomeExpenseReport(
  societyId: string,
  fromDate: string,
  toDate: string
) {
  const result = await db
    .select({
      accountId: accounts.id,
      accountCode: accounts.code,
      accountName: accounts.name,
      accountType: accounts.accountType,
      totalDebit: sql<string>`coalesce(sum(case when ${ledgerEntries.debitCredit} = 'debit' then ${ledgerEntries.amount}::numeric else 0 end), 0)`,
      totalCredit: sql<string>`coalesce(sum(case when ${ledgerEntries.debitCredit} = 'credit' then ${ledgerEntries.amount}::numeric else 0 end), 0)`,
    })
    .from(ledgerEntries)
    .innerJoin(accounts, eq(ledgerEntries.accountId, accounts.id))
    .where(
      and(
        eq(ledgerEntries.societyId, societyId),
        gte(ledgerEntries.date, fromDate),
        lte(ledgerEntries.date, toDate),
        sql`${accounts.accountType} in ('income', 'expense')`
      )
    )
    .groupBy(accounts.id, accounts.code, accounts.name, accounts.accountType)
    .orderBy(asc(accounts.code));

  const incomeItems = result
    .filter((r) => r.accountType === "income")
    .map((r) => ({
      code: r.accountCode,
      name: r.accountName,
      amount: parseFloat(r.totalCredit) - parseFloat(r.totalDebit),
    }));

  const expenseItems = result
    .filter((r) => r.accountType === "expense")
    .map((r) => ({
      code: r.accountCode,
      name: r.accountName,
      amount: parseFloat(r.totalDebit) - parseFloat(r.totalCredit),
    }));

  const totalIncome = incomeItems.reduce((s, i) => s + i.amount, 0);
  const totalExpense = expenseItems.reduce((s, i) => s + i.amount, 0);

  return {
    income: incomeItems,
    expenses: expenseItems,
    totalIncome,
    totalExpense,
    surplus: totalIncome - totalExpense,
  };
}

// ─── Fund Position (Balance Sheet Summary) ───

export async function getFundPosition(societyId: string) {
  const result = await db
    .select({
      accountCode: accounts.code,
      accountName: accounts.name,
      accountType: accounts.accountType,
      totalDebit: sql<string>`coalesce(sum(case when ${ledgerEntries.debitCredit} = 'debit' then ${ledgerEntries.amount}::numeric else 0 end), 0)`,
      totalCredit: sql<string>`coalesce(sum(case when ${ledgerEntries.debitCredit} = 'credit' then ${ledgerEntries.amount}::numeric else 0 end), 0)`,
    })
    .from(ledgerEntries)
    .innerJoin(accounts, eq(ledgerEntries.accountId, accounts.id))
    .where(
      and(
        eq(ledgerEntries.societyId, societyId),
        sql`${accounts.accountType} in ('asset', 'liability', 'equity')`
      )
    )
    .groupBy(accounts.id, accounts.code, accounts.name, accounts.accountType)
    .orderBy(asc(accounts.code));

  const assets = result
    .filter((r) => r.accountType === "asset")
    .map((r) => ({
      code: r.accountCode,
      name: r.accountName,
      balance: parseFloat(r.totalDebit) - parseFloat(r.totalCredit),
    }));

  const liabilities = result
    .filter((r) => r.accountType === "liability")
    .map((r) => ({
      code: r.accountCode,
      name: r.accountName,
      balance: parseFloat(r.totalCredit) - parseFloat(r.totalDebit),
    }));

  const equity = result
    .filter((r) => r.accountType === "equity")
    .map((r) => ({
      code: r.accountCode,
      name: r.accountName,
      balance: parseFloat(r.totalCredit) - parseFloat(r.totalDebit),
    }));

  return {
    assets,
    liabilities,
    equity,
    totalAssets: assets.reduce((s, a) => s + a.balance, 0),
    totalLiabilities: liabilities.reduce((s, l) => s + l.balance, 0),
    totalEquity: equity.reduce((s, e) => s + e.balance, 0),
  };
}
