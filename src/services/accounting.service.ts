"use server";

import { db } from "@/db";
import {
  journalEntries,
  ledgerEntries,
  accounts,
} from "@/db/schema";
import { eq, and, sql, lte, gte } from "drizzle-orm";
import { getFinancialYear } from "@/lib/utils/dates";

interface LedgerLine {
  accountId: string;
  debitCredit: "debit" | "credit";
  amount: string; // NUMERIC as string
  narration?: string;
  unitId?: string;
  memberId?: string;
}

interface CreateJournalEntryInput {
  societyId: string;
  date: string; // YYYY-MM-DD
  narration: string;
  sourceType?: string;
  sourceId?: string;
  createdBy?: string;
  lines: LedgerLine[];
}

/**
 * Create a balanced journal entry with ledger lines.
 * Throws if debits != credits.
 */
export async function createJournalEntry(input: CreateJournalEntryInput) {
  const { societyId, date, narration, sourceType, sourceId, createdBy, lines } =
    input;

  // Validate: total debits must equal total credits
  let totalDebit = 0;
  let totalCredit = 0;
  for (const line of lines) {
    const amt = parseFloat(line.amount);
    if (amt <= 0) throw new Error("Ledger amounts must be positive");
    if (line.debitCredit === "debit") totalDebit += amt;
    else totalCredit += amt;
  }

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error(
      `Journal entry not balanced: DR ${totalDebit.toFixed(2)} != CR ${totalCredit.toFixed(2)}`
    );
  }

  // Generate entry number: JE-YYYYMM-XXXX
  const entryNumber = await getNextEntryNumber(societyId, date);
  const financialYear = getFinancialYear(date);

  return db.transaction(async (tx) => {
    // Insert journal entry
    const [je] = await tx
      .insert(journalEntries)
      .values({
        societyId,
        entryNumber,
        date,
        narration,
        status: "posted",
        sourceType,
        sourceId,
        financialYear,
        createdBy,
      })
      .returning();

    // Insert ledger entries
    const ledgerValues = lines.map((line, i) => ({
      societyId,
      journalEntryId: je.id,
      accountId: line.accountId,
      debitCredit: line.debitCredit,
      amount: line.amount,
      date,
      narration: line.narration,
      unitId: line.unitId,
      memberId: line.memberId,
    }));

    await tx.insert(ledgerEntries).values(ledgerValues);

    return je;
  });
}

async function getNextEntryNumber(
  societyId: string,
  date: string
): Promise<string> {
  const ym = date.slice(0, 7).replace("-", ""); // YYYYMM
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(journalEntries)
    .where(
      and(
        eq(journalEntries.societyId, societyId),
        sql`to_char(${journalEntries.date}::date, 'YYYYMM') = ${ym}`
      )
    );
  const seq = (result.count + 1).toString().padStart(4, "0");
  return `JE-${ym}-${seq}`;
}

/**
 * Get account balance (debit - credit for assets/expenses, credit - debit for liabilities/income/equity).
 */
export async function getAccountBalance(
  accountId: string,
  societyId: string,
  upToDate?: string
) {
  const conditions = [
    eq(ledgerEntries.accountId, accountId),
    eq(ledgerEntries.societyId, societyId),
  ];
  if (upToDate) {
    conditions.push(lte(ledgerEntries.date, upToDate));
  }

  const [result] = await db
    .select({
      totalDebit: sql<string>`coalesce(sum(case when ${ledgerEntries.debitCredit} = 'debit' then ${ledgerEntries.amount} else 0 end), 0)`,
      totalCredit: sql<string>`coalesce(sum(case when ${ledgerEntries.debitCredit} = 'credit' then ${ledgerEntries.amount} else 0 end), 0)`,
    })
    .from(ledgerEntries)
    .where(and(...conditions));

  return {
    totalDebit: parseFloat(result.totalDebit),
    totalCredit: parseFloat(result.totalCredit),
    balance: parseFloat(result.totalDebit) - parseFloat(result.totalCredit),
  };
}

/**
 * Get outstanding balance for a specific unit (sum of AR-Maintenance for that unit).
 */
export async function getUnitOutstanding(
  societyId: string,
  unitId: string,
  upToDate?: string
) {
  // AR-Maintenance account code is 1010
  const [arAccount] = await db
    .select()
    .from(accounts)
    .where(
      and(eq(accounts.societyId, societyId), eq(accounts.code, "1010"))
    )
    .limit(1);

  if (!arAccount) return 0;

  const conditions = [
    eq(ledgerEntries.accountId, arAccount.id),
    eq(ledgerEntries.societyId, societyId),
    eq(ledgerEntries.unitId, unitId),
  ];
  if (upToDate) {
    conditions.push(lte(ledgerEntries.date, upToDate));
  }

  const [result] = await db
    .select({
      debit: sql<string>`coalesce(sum(case when ${ledgerEntries.debitCredit} = 'debit' then ${ledgerEntries.amount} else 0 end), 0)`,
      credit: sql<string>`coalesce(sum(case when ${ledgerEntries.debitCredit} = 'credit' then ${ledgerEntries.amount} else 0 end), 0)`,
    })
    .from(ledgerEntries)
    .where(and(...conditions));

  // AR is an asset: balance = debit - credit (positive means outstanding)
  return parseFloat(result.debit) - parseFloat(result.credit);
}

/**
 * Get summary of all unit outstanding balances for a society.
 */
export async function getSocietyOutstandingSummary(societyId: string) {
  const [arAccount] = await db
    .select()
    .from(accounts)
    .where(
      and(eq(accounts.societyId, societyId), eq(accounts.code, "1010"))
    )
    .limit(1);

  if (!arAccount) return [];

  const result = await db
    .select({
      unitId: ledgerEntries.unitId,
      debit: sql<string>`coalesce(sum(case when ${ledgerEntries.debitCredit} = 'debit' then ${ledgerEntries.amount} else 0 end), 0)`,
      credit: sql<string>`coalesce(sum(case when ${ledgerEntries.debitCredit} = 'credit' then ${ledgerEntries.amount} else 0 end), 0)`,
    })
    .from(ledgerEntries)
    .where(
      and(
        eq(ledgerEntries.accountId, arAccount.id),
        eq(ledgerEntries.societyId, societyId)
      )
    )
    .groupBy(ledgerEntries.unitId);

  return result.map((r) => ({
    unitId: r.unitId,
    outstanding: parseFloat(r.debit) - parseFloat(r.credit),
  }));
}
