import { eq } from "drizzle-orm";
import { db } from "./index";
import { accounts } from "./schema/accounts";

type AccountType = "asset" | "liability" | "income" | "expense" | "equity";

interface AccountSeed {
  code: string;
  name: string;
  accountType: AccountType;
  description?: string;
}

const DEFAULT_CHART_OF_ACCOUNTS: AccountSeed[] = [
  // ASSETS (1xxx)
  { code: "1001", name: "Bank Account - Operating", accountType: "asset", description: "Primary operating bank account" },
  { code: "1002", name: "Bank Account - Sinking Fund", accountType: "asset", description: "Dedicated sinking fund bank account" },
  { code: "1003", name: "Cash in Hand", accountType: "asset", description: "Physical cash held by treasurer" },
  { code: "1010", name: "Accounts Receivable - Maintenance", accountType: "asset", description: "Outstanding maintenance dues from members" },
  { code: "1011", name: "Accounts Receivable - Other", accountType: "asset", description: "Other receivables" },
  { code: "1020", name: "TDS Receivable", accountType: "asset", description: "Tax deducted at source receivable" },
  { code: "1030", name: "Advance to Vendors", accountType: "asset", description: "Advance payments to vendors" },

  // LIABILITIES (2xxx)
  { code: "2001", name: "Advance from Members", accountType: "liability", description: "Advance maintenance collected" },
  { code: "2002", name: "Security Deposits", accountType: "liability", description: "Refundable deposits from vendors/tenants" },
  { code: "2003", name: "GST Payable", accountType: "liability", description: "GST output tax payable" },
  { code: "2010", name: "Accounts Payable", accountType: "liability", description: "Amounts owed to vendors" },

  // INCOME (3xxx)
  { code: "3001", name: "Maintenance Income", accountType: "income", description: "Monthly maintenance charges" },
  { code: "3002", name: "Sinking Fund Income", accountType: "income", description: "Sinking fund contributions" },
  { code: "3003", name: "Water Charges Income", accountType: "income", description: "Water supply charges" },
  { code: "3004", name: "Parking Charges Income", accountType: "income", description: "Parking allocation charges" },
  { code: "3005", name: "Non-Occupancy Charges Income", accountType: "income", description: "Charges for non-occupied units" },
  { code: "3010", name: "Interest on Late Payment", accountType: "income", description: "Penalty interest on overdue maintenance" },
  { code: "3020", name: "Transfer Fee Income", accountType: "income", description: "Fees for flat ownership transfer" },
  { code: "3030", name: "Interest on FD / Savings", accountType: "income", description: "Bank interest earned" },
  { code: "3040", name: "Facility Booking Income", accountType: "income", description: "Revenue from facility bookings" },
  { code: "3099", name: "Other Income", accountType: "income", description: "Miscellaneous income" },

  // EXPENSES (4xxx)
  { code: "4001", name: "Electricity - Common Area", accountType: "expense", description: "Common area electricity bills" },
  { code: "4002", name: "Water Supply", accountType: "expense", description: "Water supply charges" },
  { code: "4003", name: "Lift Maintenance", accountType: "expense", description: "Elevator maintenance and AMC" },
  { code: "4004", name: "Security Charges", accountType: "expense", description: "Security agency payments" },
  { code: "4005", name: "Housekeeping", accountType: "expense", description: "Cleaning and housekeeping" },
  { code: "4006", name: "Garden Maintenance", accountType: "expense", description: "Gardening and landscaping" },
  { code: "4007", name: "Repairs & Maintenance", accountType: "expense", description: "General repairs" },
  { code: "4008", name: "DG Fuel & Maintenance", accountType: "expense", description: "Diesel generator fuel and maintenance" },
  { code: "4009", name: "Pest Control", accountType: "expense", description: "Pest control services" },
  { code: "4010", name: "Insurance Premium", accountType: "expense", description: "Building and liability insurance" },
  { code: "4011", name: "Municipal Taxes", accountType: "expense", description: "Property tax and municipal charges" },
  { code: "4020", name: "Bank Charges", accountType: "expense", description: "Bank service charges" },
  { code: "4021", name: "GST Paid", accountType: "expense", description: "GST input tax (non-recoverable)" },
  { code: "4030", name: "Legal & Professional Fees", accountType: "expense", description: "Legal, audit, and professional fees" },
  { code: "4040", name: "Salaries & Wages", accountType: "expense", description: "Society staff salaries" },
  { code: "4050", name: "Printing & Stationery", accountType: "expense", description: "Office supplies" },
  { code: "4060", name: "Software & IT", accountType: "expense", description: "Software subscriptions and IT" },
  { code: "4099", name: "Miscellaneous Expenses", accountType: "expense", description: "Other expenses" },

  // EQUITY (5xxx)
  { code: "5001", name: "Sinking Fund Reserve", accountType: "equity", description: "Accumulated sinking fund" },
  { code: "5002", name: "Repair Fund Reserve", accountType: "equity", description: "Accumulated repair fund" },
  { code: "5003", name: "Opening Balance Equity", accountType: "equity", description: "Opening balances on migration" },
];

export async function seedChartOfAccounts(societyId: string) {
  const existing = await db
    .select({ code: accounts.code })
    .from(accounts)
    .where(eq(accounts.societyId, societyId))
    .limit(1);

  if (existing.length > 0) {
    console.log(`[Seed] Society ${societyId} already has accounts, skipping`);
    return;
  }

  const rows = DEFAULT_CHART_OF_ACCOUNTS.map((a, i) => ({
    societyId,
    code: a.code,
    name: a.name,
    accountType: a.accountType,
    isSystemAccount: true,
    description: a.description,
    sortOrder: i,
  }));

  await db.insert(accounts).values(rows);
  console.log(
    `[Seed] Created ${rows.length} accounts for society ${societyId}`
  );
}

export { DEFAULT_CHART_OF_ACCOUNTS };
