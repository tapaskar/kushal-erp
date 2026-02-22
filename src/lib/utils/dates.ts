/**
 * Format a date as DD/MM/YYYY (Indian format).
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Format a date as "15 Jan 2025" style.
 */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Get the Indian financial year string (e.g., "2025-2026") for a given date.
 * Indian FY runs April to March.
 */
export function getFinancialYear(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const month = d.getMonth(); // 0-indexed
  const year = d.getFullYear();

  // April (month 3) onwards is the start of a new FY
  const fyStart = month >= 3 ? year : year - 1;
  return `${fyStart}-${fyStart + 1}`;
}

/**
 * Get today's date as YYYY-MM-DD string in IST.
 */
export function todayIST(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
}
