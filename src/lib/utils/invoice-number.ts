/**
 * Generate invoice number: INV-YYYYMM-XXXX
 * e.g., INV-202504-0001
 */
export function generateInvoiceNumber(
  year: number,
  month: number,
  sequence: number
): string {
  const ym = `${year}${month.toString().padStart(2, "0")}`;
  const seq = sequence.toString().padStart(4, "0");
  return `INV-${ym}-${seq}`;
}

/**
 * Get the month name for display.
 */
export function getMonthName(month: number): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return months[month - 1] || "";
}
