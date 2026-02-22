"use server";

import { db } from "@/db";
import {
  purchaseRequests,
  purchaseRequestItems,
  rfqs,
  rfqVendors,
  quotations,
  quotationItems,
  purchaseOrders,
  vendors,
  users,
} from "@/db/schema";
import { eq, and, desc, asc, sql, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { getVendorsByCategory } from "./vendor.service";

type VendorCategory =
  | "housekeeping"
  | "heavy_machinery"
  | "furniture"
  | "electronics"
  | "fire_safety"
  | "dg_parts"
  | "garden"
  | "sports"
  | "plumbing"
  | "electrical"
  | "civil"
  | "it_amc"
  | "security"
  | "pest_control"
  | "lift_maintenance"
  | "painting"
  | "other";

// ─── Reference Number Generators ───

function generateRefNo(prefix: string) {
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${ym}-${rand}`;
}

// ─── Purchase Requests ───

export async function createPurchaseRequest(data: {
  societyId: string;
  title: string;
  description?: string;
  category: VendorCategory;
  priority?: "low" | "normal" | "urgent";
  requiredByDate?: string;
  items: Array<{
    itemName: string;
    specification?: string;
    quantity: string;
    unit: string;
    estimatedUnitPrice?: string;
  }>;
}) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const referenceNo = generateRefNo("PR");

  return db.transaction(async (tx) => {
    const [pr] = await tx
      .insert(purchaseRequests)
      .values({
        societyId: data.societyId,
        referenceNo,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority || "normal",
        status: "open",
        requiredByDate: data.requiredByDate,
        requestedBy: session.userId,
      })
      .returning();

    await tx.insert(purchaseRequestItems).values(
      data.items.map((item) => ({
        purchaseRequestId: pr.id,
        itemName: item.itemName,
        specification: item.specification,
        quantity: item.quantity,
        unit: item.unit,
        estimatedUnitPrice: item.estimatedUnitPrice,
      }))
    );

    revalidatePath("/procurement/requests");
    return pr;
  });
}

export async function getPurchaseRequests(societyId: string) {
  return db
    .select({
      pr: purchaseRequests,
      requestedByUser: { name: users.name },
    })
    .from(purchaseRequests)
    .leftJoin(users, eq(purchaseRequests.requestedBy, users.id))
    .where(eq(purchaseRequests.societyId, societyId))
    .orderBy(desc(purchaseRequests.createdAt));
}

export async function getPurchaseRequest(id: string) {
  const [result] = await db
    .select({
      pr: purchaseRequests,
      requestedByUser: { name: users.name },
    })
    .from(purchaseRequests)
    .leftJoin(users, eq(purchaseRequests.requestedBy, users.id))
    .where(eq(purchaseRequests.id, id))
    .limit(1);

  if (!result) return null;

  const items = await db
    .select()
    .from(purchaseRequestItems)
    .where(eq(purchaseRequestItems.purchaseRequestId, id))
    .orderBy(asc(purchaseRequestItems.createdAt));

  return { ...result, items };
}

// ─── RFQ ───

export async function createRfq(
  prId: string,
  data: { deadline: string; terms?: string }
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  // Load PR to get societyId and category
  const pr = await getPurchaseRequest(prId);
  if (!pr) throw new Error("Purchase request not found");
  if (pr.pr.status !== "open") throw new Error("PR is not in open status");

  // Find approved vendors matching the category
  const matchingVendors = await getVendorsByCategory(
    pr.pr.societyId,
    pr.pr.category as VendorCategory
  );

  const referenceNo = generateRefNo("RFQ");

  return db.transaction(async (tx) => {
    // Create RFQ
    const [rfq] = await tx
      .insert(rfqs)
      .values({
        societyId: pr.pr.societyId,
        purchaseRequestId: prId,
        referenceNo,
        deadline: data.deadline,
        terms: data.terms,
        status: "sent",
        sentAt: new Date(),
        createdBy: session.userId,
      })
      .returning();

    // Insert rfq_vendors with unique tokens
    if (matchingVendors.length > 0) {
      await tx.insert(rfqVendors).values(
        matchingVendors.map((v) => ({
          rfqId: rfq.id,
          vendorId: v.id,
          invitedAt: new Date(),
        }))
      );
    }

    // Update PR status
    await tx
      .update(purchaseRequests)
      .set({ status: "rfq_sent", updatedAt: new Date() })
      .where(eq(purchaseRequests.id, prId));

    // Send emails in background (non-blocking)
    sendRfqEmails(rfq.id, pr.pr, pr.items).catch((e) =>
      console.error("RFQ email error:", e)
    );

    revalidatePath("/procurement/requests");
    revalidatePath(`/procurement/rfq/${rfq.id}`);
    return rfq;
  });
}

export async function getRfq(id: string) {
  const [rfq] = await db
    .select({
      rfq: rfqs,
      pr: purchaseRequests,
      createdByUser: { name: users.name },
    })
    .from(rfqs)
    .innerJoin(purchaseRequests, eq(rfqs.purchaseRequestId, purchaseRequests.id))
    .leftJoin(users, eq(rfqs.createdBy, users.id))
    .where(eq(rfqs.id, id))
    .limit(1);

  if (!rfq) return null;

  const prItems = await db
    .select()
    .from(purchaseRequestItems)
    .where(eq(purchaseRequestItems.purchaseRequestId, rfq.pr.id))
    .orderBy(asc(purchaseRequestItems.createdAt));

  const invited = await db
    .select({
      rfqVendor: rfqVendors,
      vendor: vendors,
    })
    .from(rfqVendors)
    .innerJoin(vendors, eq(rfqVendors.vendorId, vendors.id))
    .where(eq(rfqVendors.rfqId, id));

  const quotationList = await db
    .select({
      quotation: quotations,
      vendor: vendors,
    })
    .from(quotations)
    .innerJoin(vendors, eq(quotations.vendorId, vendors.id))
    .where(eq(quotations.rfqId, id))
    .orderBy(asc(quotations.rank), asc(quotations.totalAmount));

  const quotationIds = quotationList.map((q) => q.quotation.id);
  const allItems =
    quotationIds.length > 0
      ? await db
          .select()
          .from(quotationItems)
          .where(inArray(quotationItems.quotationId, quotationIds))
      : [];

  const itemsMap = new Map<string, typeof allItems>();
  for (const item of allItems) {
    const list = itemsMap.get(item.quotationId) || [];
    list.push(item);
    itemsMap.set(item.quotationId, list);
  }

  return {
    ...rfq,
    prItems,
    invited,
    quotations: quotationList.map((q) => ({
      ...q,
      items: itemsMap.get(q.quotation.id) || [],
    })),
  };
}

// ─── Vendor Portal (public — no session required) ───

export async function getQuoteByToken(token: string) {
  // Reject obviously invalid tokens before hitting the DB (UUID column rejects non-UUID strings)
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(token)) return null;

  const [rfqVendorRow] = await db
    .select({
      rfqVendor: rfqVendors,
      vendor: vendors,
    })
    .from(rfqVendors)
    .innerJoin(vendors, eq(rfqVendors.vendorId, vendors.id))
    .where(eq(rfqVendors.vendorToken, token))
    .limit(1);

  if (!rfqVendorRow) return null;

  const [rfqRow] = await db
    .select({
      rfq: rfqs,
      pr: purchaseRequests,
    })
    .from(rfqs)
    .innerJoin(purchaseRequests, eq(rfqs.purchaseRequestId, purchaseRequests.id))
    .where(eq(rfqs.id, rfqVendorRow.rfqVendor.rfqId))
    .limit(1);

  if (!rfqRow) return null;

  const prItems = await db
    .select()
    .from(purchaseRequestItems)
    .where(eq(purchaseRequestItems.purchaseRequestId, rfqRow.pr.id))
    .orderBy(asc(purchaseRequestItems.createdAt));

  // Check if already submitted
  const [existingQuote] = await db
    .select()
    .from(quotations)
    .where(
      and(
        eq(quotations.rfqId, rfqVendorRow.rfqVendor.rfqId),
        eq(quotations.vendorId, rfqVendorRow.vendor.id)
      )
    )
    .limit(1);

  return {
    rfqVendor: rfqVendorRow.rfqVendor,
    vendor: rfqVendorRow.vendor,
    rfq: rfqRow.rfq,
    pr: rfqRow.pr,
    prItems,
    alreadySubmitted: !!existingQuote,
    existingQuoteId: existingQuote?.id,
  };
}

export async function submitQuotation(
  token: string,
  data: {
    validUntil?: string;
    deliveryDays?: number;
    paymentTerms?: string;
    notes?: string;
    items: Array<{
      prItemId: string;
      itemName: string;
      quantity: string;
      unit: string;
      unitPrice: string;
      gstPercent: string;
    }>;
  }
) {
  // Validate token
  const quoteContext = await getQuoteByToken(token);
  if (!quoteContext) throw new Error("Invalid or expired link");
  if (quoteContext.alreadySubmitted)
    throw new Error("Quotation already submitted");
  if (quoteContext.rfq.status === "closed")
    throw new Error("RFQ is already closed");

  const referenceNo = generateRefNo("Q");

  // Calculate totals
  let subtotal = 0;
  let gstAmount = 0;

  const itemsWithTotals = data.items.map((item) => {
    const qty = parseFloat(item.quantity);
    const price = parseFloat(item.unitPrice);
    const gst = parseFloat(item.gstPercent || "0");
    const lineTotal = qty * price;
    const lineGst = lineTotal * (gst / 100);
    subtotal += lineTotal;
    gstAmount += lineGst;
    return {
      ...item,
      lineTotal: lineTotal.toFixed(2),
      gstPercent: gst.toFixed(2),
    };
  });

  const totalAmount = (subtotal + gstAmount).toFixed(2);

  return db.transaction(async (tx) => {
    const [quotation] = await tx
      .insert(quotations)
      .values({
        societyId: quoteContext.pr.societyId,
        rfqId: quoteContext.rfq.id,
        vendorId: quoteContext.vendor.id,
        referenceNo,
        status: "submitted",
        validUntil: data.validUntil,
        deliveryDays: data.deliveryDays,
        paymentTerms: data.paymentTerms,
        subtotal: subtotal.toFixed(2),
        gstAmount: gstAmount.toFixed(2),
        totalAmount,
        notes: data.notes,
        submittedAt: new Date(),
      })
      .returning();

    await tx.insert(quotationItems).values(
      itemsWithTotals.map((item) => ({
        quotationId: quotation.id,
        prItemId: item.prItemId,
        itemName: item.itemName,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        gstPercent: item.gstPercent,
        lineTotal: item.lineTotal,
      }))
    );

    // Update PR status to quotes_received
    await tx
      .update(purchaseRequests)
      .set({ status: "quotes_received", updatedAt: new Date() })
      .where(eq(purchaseRequests.id, quoteContext.pr.id));

    // Update email sent timestamp on rfq_vendors
    await tx
      .update(rfqVendors)
      .set({ emailSentAt: new Date() })
      .where(eq(rfqVendors.vendorToken, token));

    return quotation;
  });
}

// ─── Rank Quotations (L1/L2/L3) ───

export async function rankQuotations(rfqId: string) {
  const quoteList = await db
    .select()
    .from(quotations)
    .where(and(eq(quotations.rfqId, rfqId), eq(quotations.status, "submitted")))
    .orderBy(asc(quotations.totalAmount));

  for (let i = 0; i < quoteList.length; i++) {
    await db
      .update(quotations)
      .set({
        rank: i + 1,
        status: "shortlisted",
        updatedAt: new Date(),
      })
      .where(eq(quotations.id, quoteList[i].id));
  }

  revalidatePath(`/procurement/rfq/${rfqId}`);
  return quoteList.length;
}

// ─── Purchase Orders ───

export async function createPurchaseOrder(
  rfqId: string,
  quotationId: string,
  approvalRemark?: string
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const [quotation] = await db
    .select()
    .from(quotations)
    .where(eq(quotations.id, quotationId))
    .limit(1);

  if (!quotation) throw new Error("Quotation not found");

  const referenceNo = generateRefNo("PO");

  return db.transaction(async (tx) => {
    const [po] = await tx
      .insert(purchaseOrders)
      .values({
        societyId: quotation.societyId,
        rfqId,
        quotationId,
        vendorId: quotation.vendorId,
        referenceNo,
        status: "pending_l1",
        approvalRemark,
        totalAmount: quotation.totalAmount,
        deliveryDays: quotation.deliveryDays,
        paymentTerms: quotation.paymentTerms,
        createdBy: session.userId,
      })
      .returning();

    // Mark quotation as accepted
    await tx
      .update(quotations)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(quotations.id, quotationId));

    // Mark other quotations as rejected
    await tx
      .update(quotations)
      .set({ status: "rejected", updatedAt: new Date() })
      .where(
        and(
          eq(quotations.rfqId, rfqId),
          sql`${quotations.id} != ${quotationId}`
        )
      );

    // Update PR status
    await tx
      .update(purchaseRequests)
      .set({ status: "po_created", updatedAt: new Date() })
      .where(eq(purchaseRequests.id, (await db.select().from(rfqs).where(eq(rfqs.id, rfqId)).limit(1))[0].purchaseRequestId));

    revalidatePath("/procurement/orders");
    revalidatePath(`/procurement/rfq/${rfqId}`);
    return po;
  });
}

export async function approvePO(
  poId: string,
  level: "l1" | "l2" | "l3"
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const statusMap = {
    l1: { current: "pending_l1", next: "pending_l2" as const },
    l2: { current: "pending_l2", next: "pending_l3" as const },
    l3: { current: "pending_l3", next: "approved" as const },
  };

  const { current, next } = statusMap[level];
  const now = new Date();

  const updateData: Record<string, unknown> = {
    status: next,
    updatedAt: now,
  };

  if (level === "l1") {
    updateData.l1ApprovedBy = session.userId;
    updateData.l1ApprovedAt = now;
  } else if (level === "l2") {
    updateData.l2ApprovedBy = session.userId;
    updateData.l2ApprovedAt = now;
  } else {
    updateData.l3ApprovedBy = session.userId;
    updateData.l3ApprovedAt = now;
  }

  const [updated] = await db
    .update(purchaseOrders)
    .set(updateData)
    .where(
      and(
        eq(purchaseOrders.id, poId),
        eq(purchaseOrders.status, current as "pending_l1" | "pending_l2" | "pending_l3")
      )
    )
    .returning();

  if (!updated) throw new Error("PO not found or not in correct state for this approval level");

  revalidatePath("/procurement/orders");
  revalidatePath(`/procurement/orders/${poId}`);
  return updated;
}

export async function issuePO(poId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const [updated] = await db
    .update(purchaseOrders)
    .set({ status: "issued", issuedAt: new Date(), updatedAt: new Date() })
    .where(
      and(eq(purchaseOrders.id, poId), eq(purchaseOrders.status, "approved"))
    )
    .returning();

  if (!updated) throw new Error("PO not approved yet");

  revalidatePath("/procurement/orders");
  revalidatePath(`/procurement/orders/${poId}`);
  return updated;
}

export async function markPODelivered(poId: string) {
  const [updated] = await db
    .update(purchaseOrders)
    .set({ status: "delivered", deliveredAt: new Date(), updatedAt: new Date() })
    .where(
      and(eq(purchaseOrders.id, poId), eq(purchaseOrders.status, "issued"))
    )
    .returning();

  revalidatePath("/procurement/orders");
  revalidatePath(`/procurement/orders/${poId}`);
  return updated;
}

export async function getPurchaseOrders(societyId: string) {
  return db
    .select({
      po: purchaseOrders,
      vendor: { name: vendors.name, email: vendors.email },
      rfq: { referenceNo: rfqs.referenceNo },
      createdByUser: { name: users.name },
    })
    .from(purchaseOrders)
    .innerJoin(vendors, eq(purchaseOrders.vendorId, vendors.id))
    .innerJoin(rfqs, eq(purchaseOrders.rfqId, rfqs.id))
    .leftJoin(users, eq(purchaseOrders.createdBy, users.id))
    .where(eq(purchaseOrders.societyId, societyId))
    .orderBy(desc(purchaseOrders.createdAt));
}

export async function getPurchaseOrder(id: string) {
  const [result] = await db
    .select({
      po: purchaseOrders,
      vendor: vendors,
      rfq: rfqs,
      quotation: quotations,
      createdByUser: { name: users.name },
    })
    .from(purchaseOrders)
    .innerJoin(vendors, eq(purchaseOrders.vendorId, vendors.id))
    .innerJoin(rfqs, eq(purchaseOrders.rfqId, rfqs.id))
    .innerJoin(quotations, eq(purchaseOrders.quotationId, quotations.id))
    .leftJoin(users, eq(purchaseOrders.createdBy, users.id))
    .where(eq(purchaseOrders.id, id))
    .limit(1);

  if (!result) return null;

  const items = await db
    .select()
    .from(quotationItems)
    .where(eq(quotationItems.quotationId, result.po.quotationId))
    .orderBy(asc(quotationItems.createdAt));

  // Load approval user names
  const approverIds = [
    result.po.l1ApprovedBy,
    result.po.l2ApprovedBy,
    result.po.l3ApprovedBy,
  ].filter(Boolean) as string[];

  const approvers =
    approverIds.length > 0
      ? await db
          .select({ id: users.id, name: users.name })
          .from(users)
          .where(inArray(users.id, approverIds))
      : [];

  const approverMap = new Map(approvers.map((u) => [u.id, u.name]));

  return {
    ...result,
    items,
    l1ApproverName: result.po.l1ApprovedBy
      ? approverMap.get(result.po.l1ApprovedBy)
      : null,
    l2ApproverName: result.po.l2ApprovedBy
      ? approverMap.get(result.po.l2ApprovedBy)
      : null,
    l3ApproverName: result.po.l3ApprovedBy
      ? approverMap.get(result.po.l3ApprovedBy)
      : null,
  };
}

// ─── Procurement Dashboard Stats ───

export async function getProcurementStats(societyId: string) {
  const [prStats] = await db
    .select({
      openPRs: sql<number>`count(*) filter (where ${purchaseRequests.status} in ('open', 'rfq_sent', 'quotes_received'))`,
      pendingRFQs: sql<number>`count(*) filter (where ${purchaseRequests.status} = 'rfq_sent')`,
      pendingQuotes: sql<number>`count(*) filter (where ${purchaseRequests.status} = 'quotes_received')`,
    })
    .from(purchaseRequests)
    .where(eq(purchaseRequests.societyId, societyId));

  const [poStats] = await db
    .select({
      pendingApproval: sql<number>`count(*) filter (where ${purchaseOrders.status} in ('pending_l1', 'pending_l2', 'pending_l3'))`,
      approved: sql<number>`count(*) filter (where ${purchaseOrders.status} = 'approved')`,
      issued: sql<number>`count(*) filter (where ${purchaseOrders.status} = 'issued')`,
    })
    .from(purchaseOrders)
    .where(eq(purchaseOrders.societyId, societyId));

  return { ...prStats, ...poStats };
}

// ─── Email via SES ───

async function sendRfqEmails(
  rfqId: string,
  pr: typeof purchaseRequests.$inferSelect,
  items: Array<typeof purchaseRequestItems.$inferSelect>
) {
  const invited = await db
    .select({ rfqVendor: rfqVendors, vendor: vendors })
    .from(rfqVendors)
    .innerJoin(vendors, eq(rfqVendors.vendorId, vendors.id))
    .where(eq(rfqVendors.rfqId, rfqId));

  const [rfqRow] = await db
    .select()
    .from(rfqs)
    .where(eq(rfqs.id, rfqId))
    .limit(1);

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const deadline = rfqRow.deadline;

  // Dynamically import SES client to avoid bundling on client
  const { SESClient, SendEmailCommand } = await import(
    "@aws-sdk/client-ses"
  );
  const ses = new SESClient({ region: process.env.AWS_REGION || "ap-south-1" });

  const itemsList = items
    .map(
      (i) =>
        `<tr><td>${i.itemName}</td><td>${i.quantity} ${i.unit}</td>${i.specification ? `<td>${i.specification}</td>` : "<td>—</td>"}</tr>`
    )
    .join("");

  for (const { rfqVendor, vendor } of invited) {
    const quoteUrl = `${appUrl}/quote/${rfqVendor.vendorToken}`;
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1e40af">Quote Request — ${rfqRow.referenceNo}</h2>
        <p>Dear <strong>${vendor.contactPerson || vendor.name}</strong>,</p>
        <p>Kushal-RWA requests your quotation for the following items. Please respond by <strong>${deadline}</strong>.</p>
        <h3>${pr.title}</h3>
        <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">
          <thead style="background:#f1f5f9">
            <tr><th>Item</th><th>Quantity</th><th>Specifications</th></tr>
          </thead>
          <tbody>${itemsList}</tbody>
        </table>
        ${rfqRow.terms ? `<p><strong>Terms:</strong> ${rfqRow.terms}</p>` : ""}
        <div style="margin:24px 0">
          <a href="${quoteUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">
            Submit Your Quote →
          </a>
        </div>
        <p style="color:#64748b;font-size:12px">This link is unique to your business. Please do not share it.</p>
      </div>
    `;

    try {
      await ses.send(
        new SendEmailCommand({
          Source: process.env.SES_FROM_EMAIL!,
          Destination: { ToAddresses: [vendor.email] },
          Message: {
            Subject: {
              Data: `[${rfqRow.referenceNo}] Quote Request — Kushal-RWA — Respond by ${deadline}`,
            },
            Body: { Html: { Data: html } },
          },
        })
      );

      await db
        .update(rfqVendors)
        .set({ emailSentAt: new Date() })
        .where(eq(rfqVendors.id, rfqVendor.id));
    } catch (err) {
      console.error(`Failed to send RFQ email to ${vendor.email}:`, err);
    }
  }
}
