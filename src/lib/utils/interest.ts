/**
 * Calculate simple interest on an outstanding balance.
 * Rate is annual percentage. Grace days are subtracted from overdue days.
 */
export function calculateInterest(params: {
  outstandingAmount: number;
  annualRate: number; // e.g., 18 for 18%
  dueDateStr: string; // YYYY-MM-DD
  asOfDateStr: string; // YYYY-MM-DD
  graceDays: number;
}): number {
  if (params.annualRate <= 0 || params.outstandingAmount <= 0) return 0;

  const dueDate = new Date(params.dueDateStr);
  const asOfDate = new Date(params.asOfDateStr);
  const diffMs = asOfDate.getTime() - dueDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const overdueDays = diffDays - params.graceDays;

  if (overdueDays <= 0) return 0;

  // Simple interest: P * R * T / (365 * 100)
  const interest =
    (params.outstandingAmount * params.annualRate * overdueDays) / (365 * 100);

  return Math.round(interest * 100) / 100; // Round to 2 decimals
}
