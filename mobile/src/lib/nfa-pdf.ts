import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { NFA } from "./types";
import { USER_ROLES, NFA_STATUS_LABELS } from "./constants";

function formatCurrency(amount?: number): string {
  if (!amount && amount !== 0) return "-";
  return `\u20B9${Number(amount).toLocaleString("en-IN")}`;
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function generateNFAPdf(
  nfa: NFA,
  societyName: string
): Promise<void> {
  const itemRows = (nfa.items || [])
    .map(
      (item, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>
        <strong>${escapeHtml(item.itemName)}</strong>
        ${item.specification ? `<br/><small>${escapeHtml(item.specification)}</small>` : ""}
      </td>
      <td>${item.quantity} ${item.unit || "pcs"}</td>
      <td>
        ${item.l1VendorName ? `${escapeHtml(item.l1VendorName)}<br/>${formatCurrency(item.l1UnitPrice)}` : "-"}
      </td>
      <td>
        ${item.l2VendorName ? `${escapeHtml(item.l2VendorName)}<br/>${formatCurrency(item.l2UnitPrice)}` : "-"}
      </td>
      <td>
        ${item.l3VendorName ? `${escapeHtml(item.l3VendorName)}<br/>${formatCurrency(item.l3UnitPrice)}` : "-"}
      </td>
      <td>${item.selectedQuote ? item.selectedQuote.toUpperCase() : "-"}</td>
    </tr>
  `
    )
    .join("");

  const approvalRows = (nfa.approvals || [])
    .map(
      (a, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${escapeHtml(a.userName)}</td>
      <td>${USER_ROLES[a.userRole] || a.userRole}</td>
      <td class="${a.action === "approved" ? "approved" : "rejected"}">
        ${a.action.charAt(0).toUpperCase() + a.action.slice(1)}
      </td>
      <td>${a.remarks ? escapeHtml(a.remarks) : "-"}</td>
      <td>${formatDateTime(a.createdAt)}</td>
    </tr>
  `
    )
    .join("");

  // Add treasurer row if approved
  const treasurerRow = nfa.treasurerApprovedAt
    ? `
    <tr>
      <td>${(nfa.approvals?.length || 0) + 1}</td>
      <td>${nfa.treasurerApproverName || "Treasurer"}</td>
      <td>Treasurer</td>
      <td class="approved">Approved</td>
      <td>${nfa.treasurerRemarks ? escapeHtml(nfa.treasurerRemarks) : "-"}</td>
      <td>${formatDateTime(nfa.treasurerApprovedAt)}</td>
    </tr>
  `
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
      font-size: 12px;
      color: #1e293b;
      padding: 24px;
      line-height: 1.5;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #1a56db;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .header h1 {
      font-size: 18px;
      color: #1a56db;
      margin-bottom: 4px;
    }
    .header h2 {
      font-size: 22px;
      color: #1e293b;
      margin-bottom: 4px;
    }
    .header .ref {
      font-size: 14px;
      color: #64748b;
    }
    .details {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 20px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
    }
    .detail-item {
      width: 48%;
    }
    .detail-item label {
      color: #94a3b8;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .detail-item value {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      color: #fff;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 11px;
    }
    th {
      background-color: #f1f5f9;
      padding: 8px 6px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e2e8f0;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      color: #475569;
    }
    td {
      padding: 8px 6px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: top;
    }
    tr:hover { background-color: #f8fafc; }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
      margin: 20px 0 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e2e8f0;
    }
    .approved { color: #16a34a; font-weight: 600; }
    .rejected { color: #dc2626; font-weight: 600; }
    .summary-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    }
    .summary-box p { margin-bottom: 6px; }
    .footer {
      margin-top: 30px;
      text-align: center;
      color: #94a3b8;
      font-size: 10px;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
    }
    small { color: #64748b; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(societyName)}</h1>
    <h2>Note for Approval</h2>
    <div class="ref">${escapeHtml(nfa.referenceNo)} &bull; ${formatDateTime(nfa.createdAt)}</div>
  </div>

  <div class="details">
    <div class="detail-item">
      <label>Title</label>
      <value>${escapeHtml(nfa.title)}</value>
    </div>
    <div class="detail-item">
      <label>Status</label>
      <value>${NFA_STATUS_LABELS[nfa.status] || nfa.status}</value>
    </div>
    <div class="detail-item">
      <label>Category</label>
      <value>${nfa.category?.replace(/_/g, " ") || "-"}</value>
    </div>
    <div class="detail-item">
      <label>Priority</label>
      <value>${nfa.priority}</value>
    </div>
    <div class="detail-item">
      <label>Total Estimated Amount</label>
      <value style="color: #1a56db; font-size: 16px;">${formatCurrency(nfa.totalEstimatedAmount)}</value>
    </div>
    <div class="detail-item">
      <label>Created By</label>
      <value>${nfa.creatorName || "-"}</value>
    </div>
    ${nfa.description ? `
    <div class="detail-item" style="width: 100%;">
      <label>Description</label>
      <value style="font-weight: 400;">${escapeHtml(nfa.description)}</value>
    </div>
    ` : ""}
  </div>

  <div class="section-title">Items & Vendor Quotes</div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Item</th>
        <th>Qty</th>
        <th>L1 Quote</th>
        <th>L2 Quote</th>
        <th>L3 Quote</th>
        <th>Selected</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div class="section-title">Approval History</div>
  ${
    (nfa.approvals?.length || 0) > 0 || nfa.treasurerApprovedAt
      ? `
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Name</th>
        <th>Role</th>
        <th>Decision</th>
        <th>Remarks</th>
        <th>Date & Time</th>
      </tr>
    </thead>
    <tbody>
      ${approvalRows}
      ${treasurerRow}
    </tbody>
  </table>
  `
      : `<p style="color: #94a3b8; text-align: center; padding: 16px;">No approvals yet</p>`
  }

  <div class="summary-box">
    <p><strong>Current Status:</strong> ${NFA_STATUS_LABELS[nfa.status] || nfa.status}</p>
    <p><strong>Executive Approvals:</strong> ${nfa.currentExecApprovals} of ${nfa.requiredExecApprovals} required</p>
    ${nfa.currentExecRejections > 0 ? `<p><strong>Rejections:</strong> ${nfa.currentExecRejections}</p>` : ""}
    <p><strong>Quorum Status:</strong> ${
      nfa.currentExecApprovals >= nfa.requiredExecApprovals
        ? "Met"
        : `${nfa.requiredExecApprovals - nfa.currentExecApprovals} more needed`
    }</p>
  </div>

  <div class="footer">
    Generated from KushalRWA on ${new Date().toLocaleString("en-IN")}
  </div>
</body>
</html>
  `;

  // Generate PDF and share
  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      UTI: "com.adobe.pdf",
      dialogTitle: `NFA ${nfa.referenceNo}`,
    });
  }
}
