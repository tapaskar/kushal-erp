/**
 * Export data to CSV and trigger browser download
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string,
  columns?: { key: string; label: string }[]
) {
  if (data.length === 0) return;

  // Determine columns from first row if not provided
  const cols = columns || Object.keys(data[0]).map((k) => ({ key: k, label: k }));

  // Build CSV content
  const header = cols.map((c) => escapeCSV(c.label)).join(",");
  const rows = data.map((row) =>
    cols
      .map((c) => {
        const val = row[c.key];
        if (val === null || val === undefined) return "";
        if (val instanceof Date) return escapeCSV(val.toISOString());
        return escapeCSV(String(val));
      })
      .join(",")
  );

  const csv = [header, ...rows].join("\n");

  // Trigger download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Format a date string for display
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "---";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format a time string for display
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "---";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a datetime string for display
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "---";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
