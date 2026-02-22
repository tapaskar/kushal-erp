import { NextResponse } from "next/server";
import { getInvoiceDetail } from "@/services/billing.service";
import { formatINR } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import { getMonthName } from "@/lib/utils/invoice-number";

/**
 * Generate a printable HTML invoice (rendered as PDF by browser print).
 * A proper PDF generation with @react-pdf/renderer can be added later.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;
  const data = await getInvoiceDetail(invoiceId);

  if (!data) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const { invoice, unit, block, member, society, lineItems } = data;

  const lineItemRows = lineItems
    .map(
      (row, i) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${i + 1}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">
        ${row.lineItem.description}
        ${row.lineItem.areaSqft ? `<br><small style="color:#888">(${row.lineItem.areaSqft} sq.ft.)</small>` : ""}
      </td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatINR(row.lineItem.rate)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatINR(row.lineItem.amount)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">
        ${parseFloat(row.lineItem.gstAmount || "0") > 0 ? formatINR(row.lineItem.gstAmount || "0") : "—"}
      </td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;font-weight:600">${formatINR(row.lineItem.totalAmount)}</td>
    </tr>
  `
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 40px; color: #333; font-size: 14px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .society-name { font-size: 22px; font-weight: 700; color: #1a1a1a; }
    .invoice-title { font-size: 28px; font-weight: 700; color: #2563eb; text-align: right; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .meta-label { font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 0.5px; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #f8f9fa; padding: 10px 8px; text-align: left; font-size: 12px; text-transform: uppercase; color: #666; border-bottom: 2px solid #dee2e6; }
    .summary { margin-left: auto; width: 300px; }
    .summary-row { display: flex; justify-content: space-between; padding: 6px 0; }
    .summary-total { font-size: 18px; font-weight: 700; border-top: 2px solid #333; padding-top: 8px; margin-top: 4px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 12px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="society-name">${society.name}</div>
      <div style="color:#666;margin-top:4px">
        ${society.address}<br>
        ${society.city}, ${society.state} — ${society.pincode}
      </div>
    </div>
    <div>
      <div class="invoice-title">INVOICE</div>
      <div style="text-align:right;color:#666;margin-top:4px">
        ${invoice.invoiceNumber}
      </div>
    </div>
  </div>

  <div class="meta-grid">
    <div>
      <div class="meta-label">Bill To</div>
      <div style="font-weight:600">${member.name}</div>
      <div>Unit ${unit.unitNumber}, ${block.name}</div>
      <div>${member.phone}</div>
      ${member.email ? `<div>${member.email}</div>` : ""}
    </div>
    <div style="text-align:right">
      <div style="display:grid;grid-template-columns:auto auto;gap:4px 16px;justify-content:end">
        <span class="meta-label" style="text-align:right">Issue Date</span>
        <span>${formatDate(invoice.issueDate)}</span>
        <span class="meta-label" style="text-align:right">Due Date</span>
        <span style="font-weight:600">${formatDate(invoice.dueDate)}</span>
        <span class="meta-label" style="text-align:right">Period</span>
        <span>${getMonthName(invoice.billingMonth)} ${invoice.billingYear}</span>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:40px">#</th>
        <th>Description</th>
        <th style="text-align:right">Rate</th>
        <th style="text-align:right">Amount</th>
        <th style="text-align:right">GST</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${lineItemRows}
    </tbody>
  </table>

  <div class="summary">
    <div class="summary-row">
      <span style="color:#666">Subtotal</span>
      <span>${formatINR(invoice.subtotal)}</span>
    </div>
    ${parseFloat(invoice.gstAmount) > 0 ? `
    <div class="summary-row">
      <span style="color:#666">GST</span>
      <span>${formatINR(invoice.gstAmount)}</span>
    </div>` : ""}
    ${parseFloat(invoice.interestAmount) > 0 ? `
    <div class="summary-row">
      <span style="color:#c00">Interest on Overdue</span>
      <span style="color:#c00">${formatINR(invoice.interestAmount)}</span>
    </div>` : ""}
    <div class="summary-row" style="font-weight:600">
      <span>Current Charges</span>
      <span>${formatINR(invoice.totalAmount)}</span>
    </div>
    ${parseFloat(invoice.previousBalance) > 0 ? `
    <div class="summary-row">
      <span style="color:#c00">Previous Outstanding</span>
      <span style="color:#c00">${formatINR(invoice.previousBalance)}</span>
    </div>` : ""}
    ${parseFloat(invoice.paidAmount) > 0 ? `
    <div class="summary-row">
      <span style="color:#059669">Paid</span>
      <span style="color:#059669">- ${formatINR(invoice.paidAmount)}</span>
    </div>` : ""}
    <div class="summary-row summary-total">
      <span>Balance Due</span>
      <span style="color:${parseFloat(invoice.balanceDue) > 0 ? "#c00" : "#059669"}">${formatINR(invoice.balanceDue)}</span>
    </div>
  </div>

  <div class="footer">
    <p>This is a computer-generated invoice and does not require a signature.</p>
    <p>Generated by Kushal-RWA</p>
  </div>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
