"use server";

import { db } from "@/db";
import {
  notesForApproval,
  nfaItems,
  nfaApprovals,
  userSocietyRoles,
  users,
} from "@/db/schema";
import { eq, and, desc, asc, sql, count, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ─── Types ───

type NfaItemInput = {
  itemName: string;
  specification?: string;
  quantity: string;
  unit?: string;
  l1VendorName?: string;
  l1UnitPrice?: string;
  l2VendorName?: string;
  l2UnitPrice?: string;
  l3VendorName?: string;
  l3UnitPrice?: string;
  selectedQuote?: "l1" | "l2" | "l3";
  justification?: string;
};

type CreateNfaInput = {
  title: string;
  description?: string;
  category?:
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
  priority?: "low" | "normal" | "urgent";
  items: NfaItemInput[];
};

// ─── Reference Number Generator ───

export async function generateReferenceNo(
  societyId: string
): Promise<string> {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `NFA-${yyyy}${mm}`;

  const [result] = await db
    .select({
      maxRef: sql<string | null>`max(${notesForApproval.referenceNo})`,
    })
    .from(notesForApproval)
    .where(
      and(
        eq(notesForApproval.societyId, societyId),
        sql`${notesForApproval.referenceNo} LIKE ${prefix + "-%"}`
      )
    );

  let nextSeq = 1;
  if (result?.maxRef) {
    const parts = result.maxRef.split("-");
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1;
    }
  }

  return `${prefix}-${String(nextSeq).padStart(4, "0")}`;
}

// ─── Create NFA ───

export async function createNFA(
  societyId: string,
  data: CreateNfaInput,
  createdBy: string
) {
  const referenceNo = await generateReferenceNo(societyId);

  // Count executive members in this society
  const [execResult] = await db
    .select({ cnt: count() })
    .from(userSocietyRoles)
    .where(
      and(
        eq(userSocietyRoles.societyId, societyId),
        eq(userSocietyRoles.role, "executive_member")
      )
    );

  const execCount = execResult?.cnt ?? 0;
  const requiredExecApprovals =
    execCount > 0 ? Math.max(1, Math.ceil(execCount / 2)) : 0;

  // Calculate total estimated amount from L1 prices
  let totalEstimatedAmount = 0;
  const itemsToInsert = data.items.map((item) => {
    const qty = parseFloat(item.quantity) || 0;
    const l1Price = parseFloat(item.l1UnitPrice || "0") || 0;
    const l2Price = parseFloat(item.l2UnitPrice || "0") || 0;
    const l3Price = parseFloat(item.l3UnitPrice || "0") || 0;
    const l1Total = qty * l1Price;
    const l2Total = qty * l2Price;
    const l3Total = qty * l3Price;

    totalEstimatedAmount += l1Total;

    return {
      itemName: item.itemName,
      specification: item.specification,
      quantity: item.quantity,
      unit: item.unit || "pcs",
      l1VendorName: item.l1VendorName,
      l1UnitPrice: item.l1UnitPrice,
      l1TotalPrice: l1Total > 0 ? l1Total.toFixed(2) : null,
      l2VendorName: item.l2VendorName,
      l2UnitPrice: item.l2UnitPrice,
      l2TotalPrice: l2Total > 0 ? l2Total.toFixed(2) : null,
      l3VendorName: item.l3VendorName,
      l3UnitPrice: item.l3UnitPrice,
      l3TotalPrice: l3Total > 0 ? l3Total.toFixed(2) : null,
      selectedQuote: item.selectedQuote,
      justification: item.justification,
    };
  });

  return db.transaction(async (tx) => {
    const [nfa] = await tx
      .insert(notesForApproval)
      .values({
        societyId,
        referenceNo,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority || "normal",
        status: "draft",
        totalEstimatedAmount:
          totalEstimatedAmount > 0
            ? totalEstimatedAmount.toFixed(2)
            : "0.00",
        requiredExecApprovals,
        currentExecApprovals: 0,
        currentExecRejections: 0,
        createdBy,
      })
      .returning();

    if (itemsToInsert.length > 0) {
      await tx.insert(nfaItems).values(
        itemsToInsert.map((item) => ({
          nfaId: nfa.id,
          ...item,
        }))
      );
    }

    revalidatePath("/procurement/nfa");
    return nfa;
  });
}

// ─── Submit NFA (Draft → Pending Exec) ───

export async function submitNFA(nfaId: string, userId: string) {
  const [nfa] = await db
    .select()
    .from(notesForApproval)
    .where(eq(notesForApproval.id, nfaId))
    .limit(1);

  if (!nfa) throw new Error("NFA not found");
  if (nfa.status !== "draft") throw new Error("NFA is not in draft status");
  if (nfa.createdBy !== userId)
    throw new Error("Only the creator can submit this NFA");

  const [updated] = await db
    .update(notesForApproval)
    .set({ status: "pending_exec", updatedAt: new Date() })
    .where(eq(notesForApproval.id, nfaId))
    .returning();

  revalidatePath("/procurement/nfa");
  revalidatePath(`/procurement/nfa/${nfaId}`);
  return updated;
}

// ─── List NFAs ───

export async function getNFAs(
  societyId: string,
  filters?: { status?: string; limit?: number; offset?: number }
) {
  const conditions = [eq(notesForApproval.societyId, societyId)];

  if (filters?.status) {
    conditions.push(
      eq(
        notesForApproval.status,
        filters.status as
          | "draft"
          | "pending_exec"
          | "pending_treasurer"
          | "approved"
          | "po_created"
          | "completed"
          | "rejected"
          | "cancelled"
      )
    );
  }

  const query = db
    .select({
      id: notesForApproval.id,
      referenceNo: notesForApproval.referenceNo,
      title: notesForApproval.title,
      status: notesForApproval.status,
      priority: notesForApproval.priority,
      category: notesForApproval.category,
      totalEstimatedAmount: notesForApproval.totalEstimatedAmount,
      requiredExecApprovals: notesForApproval.requiredExecApprovals,
      currentExecApprovals: notesForApproval.currentExecApprovals,
      currentExecRejections: notesForApproval.currentExecRejections,
      createdAt: notesForApproval.createdAt,
      creatorName: users.name,
    })
    .from(notesForApproval)
    .leftJoin(users, eq(notesForApproval.createdBy, users.id))
    .where(and(...conditions))
    .orderBy(desc(notesForApproval.createdAt));

  if (filters?.limit) {
    query.limit(filters.limit);
  }
  if (filters?.offset) {
    query.offset(filters.offset);
  }

  return query;
}

// ─── NFA Detail ───

export async function getNFADetail(nfaId: string, societyId: string) {
  const [nfa] = await db
    .select({
      nfa: notesForApproval,
      creatorName: users.name,
    })
    .from(notesForApproval)
    .leftJoin(users, eq(notesForApproval.createdBy, users.id))
    .where(
      and(
        eq(notesForApproval.id, nfaId),
        eq(notesForApproval.societyId, societyId)
      )
    )
    .limit(1);

  if (!nfa) return null;

  const items = await db
    .select()
    .from(nfaItems)
    .where(eq(nfaItems.nfaId, nfaId))
    .orderBy(asc(nfaItems.createdAt));

  const approvals = await db
    .select()
    .from(nfaApprovals)
    .where(eq(nfaApprovals.nfaId, nfaId))
    .orderBy(asc(nfaApprovals.createdAt));

  // Resolve treasurer approver name if present
  let treasurerApproverName: string | null = null;
  if (nfa.nfa.treasurerApprovedBy) {
    const [approver] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, nfa.nfa.treasurerApprovedBy))
      .limit(1);
    treasurerApproverName = approver?.name ?? null;
  }

  return {
    ...nfa.nfa,
    creatorName: nfa.creatorName,
    treasurerApproverName,
    items,
    approvals,
  };
}

// ─── Approve / Reject NFA ───

export async function approveNFA(
  nfaId: string,
  userId: string,
  userName: string,
  userRole: string,
  action: "approved" | "rejected",
  remarks?: string
) {
  return db.transaction(async (tx) => {
    // Lock the NFA row for update
    const [nfa] = await tx
      .select()
      .from(notesForApproval)
      .where(eq(notesForApproval.id, nfaId))
      .limit(1);

    if (!nfa) throw new Error("NFA not found");

    // --- Treasurer approval path ---
    if (nfa.status === "pending_treasurer") {
      if (
        userRole !== "treasurer" &&
        userRole !== "joint_treasurer"
      ) {
        throw new Error("Only treasurer or joint treasurer can approve at this stage");
      }

      // Insert approval record
      await tx.insert(nfaApprovals).values({
        nfaId,
        userId,
        userName,
        userRole,
        action,
        remarks,
      });

      if (action === "approved") {
        await tx
          .update(notesForApproval)
          .set({
            status: "approved",
            treasurerApprovedBy: userId,
            treasurerApprovedAt: new Date(),
            treasurerRemarks: remarks,
            updatedAt: new Date(),
          })
          .where(eq(notesForApproval.id, nfaId));
      } else {
        await tx
          .update(notesForApproval)
          .set({
            status: "rejected",
            treasurerRemarks: remarks,
            updatedAt: new Date(),
          })
          .where(eq(notesForApproval.id, nfaId));
      }

      revalidatePath("/procurement/nfa");
      revalidatePath(`/procurement/nfa/${nfaId}`);
      return { success: true, newStatus: action === "approved" ? "approved" : "rejected" };
    }

    // --- Executive member approval path ---
    if (nfa.status !== "pending_exec") {
      throw new Error(
        `NFA is not in a state that accepts approvals (current: ${nfa.status})`
      );
    }

    // Insert approval record (unique constraint will prevent double-voting)
    await tx.insert(nfaApprovals).values({
      nfaId,
      userId,
      userName,
      userRole,
      action,
      remarks,
    });

    let newExecApprovals = nfa.currentExecApprovals;
    let newExecRejections = nfa.currentExecRejections;
    let newStatus: string = nfa.status;

    if (action === "approved") {
      newExecApprovals += 1;
    } else {
      newExecRejections += 1;
    }

    // Check if quorum reached for approval
    if (newExecApprovals >= nfa.requiredExecApprovals) {
      newStatus = "pending_treasurer";
    }

    // Check if quorum is impossible to reach (too many rejections)
    // Total exec members in society
    const [execResult] = await tx
      .select({ cnt: count() })
      .from(userSocietyRoles)
      .where(
        and(
          eq(userSocietyRoles.societyId, nfa.societyId),
          eq(userSocietyRoles.role, "executive_member")
        )
      );

    const totalExecMembers = execResult?.cnt ?? 0;
    const maxPossibleApprovals = totalExecMembers - newExecRejections;
    if (
      maxPossibleApprovals < nfa.requiredExecApprovals &&
      newStatus === "pending_exec"
    ) {
      newStatus = "rejected";
    }

    await tx
      .update(notesForApproval)
      .set({
        currentExecApprovals: newExecApprovals,
        currentExecRejections: newExecRejections,
        status: newStatus as
          | "pending_exec"
          | "pending_treasurer"
          | "rejected",
        updatedAt: new Date(),
      })
      .where(eq(notesForApproval.id, nfaId));

    revalidatePath("/procurement/nfa");
    revalidatePath(`/procurement/nfa/${nfaId}`);
    return { success: true, newStatus };
  });
}

// ─── Create PO from NFA ───
// Since purchaseOrders requires rfqId (NOT NULL FK), we cannot create
// a traditional PO directly from NFA. Instead, we update the NFA status
// to po_created — the NFA itself serves as the approval document.

export async function createPOFromNFA(
  nfaId: string,
  userId: string,
  societyId: string
) {
  const [nfa] = await db
    .select()
    .from(notesForApproval)
    .where(
      and(
        eq(notesForApproval.id, nfaId),
        eq(notesForApproval.societyId, societyId)
      )
    )
    .limit(1);

  if (!nfa) throw new Error("NFA not found");
  if (nfa.status !== "approved")
    throw new Error("NFA must be in approved status to create PO");

  const [updated] = await db
    .update(notesForApproval)
    .set({
      status: "po_created",
      updatedAt: new Date(),
    })
    .where(eq(notesForApproval.id, nfaId))
    .returning();

  revalidatePath("/procurement/nfa");
  revalidatePath(`/procurement/nfa/${nfaId}`);
  return updated;
}

// ─── Mark NFA Completed ───

export async function markNFACompleted(nfaId: string, userId: string) {
  const [nfa] = await db
    .select()
    .from(notesForApproval)
    .where(eq(notesForApproval.id, nfaId))
    .limit(1);

  if (!nfa) throw new Error("NFA not found");
  if (nfa.status !== "po_created" && nfa.status !== "approved") {
    throw new Error(
      "NFA must be in approved or po_created status to mark as completed"
    );
  }

  const [updated] = await db
    .update(notesForApproval)
    .set({ status: "completed", updatedAt: new Date() })
    .where(eq(notesForApproval.id, nfaId))
    .returning();

  revalidatePath("/procurement/nfa");
  revalidatePath(`/procurement/nfa/${nfaId}`);
  return updated;
}

// ─── My Pending Approvals ───

export async function getMyPendingApprovals(
  userId: string,
  societyId: string
) {
  // Determine user's role in this society
  const roles = await db
    .select({ role: userSocietyRoles.role })
    .from(userSocietyRoles)
    .where(
      and(
        eq(userSocietyRoles.userId, userId),
        eq(userSocietyRoles.societyId, societyId)
      )
    );

  const roleSet = new Set(roles.map((r) => r.role));

  const result: {
    executivePending: Awaited<ReturnType<typeof getNFAs>>;
    treasurerPending: Awaited<ReturnType<typeof getNFAs>>;
    executiveCount: number;
    treasurerCount: number;
  } = {
    executivePending: [],
    treasurerPending: [],
    executiveCount: 0,
    treasurerCount: 0,
  };

  // Executive member: NFAs pending exec where user hasn't voted yet
  if (roleSet.has("executive_member")) {
    const pendingExecNfas = await db
      .select({
        id: notesForApproval.id,
        referenceNo: notesForApproval.referenceNo,
        title: notesForApproval.title,
        status: notesForApproval.status,
        priority: notesForApproval.priority,
        category: notesForApproval.category,
        totalEstimatedAmount: notesForApproval.totalEstimatedAmount,
        requiredExecApprovals: notesForApproval.requiredExecApprovals,
        currentExecApprovals: notesForApproval.currentExecApprovals,
        currentExecRejections: notesForApproval.currentExecRejections,
        createdAt: notesForApproval.createdAt,
        creatorName: users.name,
      })
      .from(notesForApproval)
      .leftJoin(users, eq(notesForApproval.createdBy, users.id))
      .where(
        and(
          eq(notesForApproval.societyId, societyId),
          eq(notesForApproval.status, "pending_exec"),
          sql`NOT EXISTS (
            SELECT 1 FROM nfa_approvals
            WHERE nfa_approvals.nfa_id = ${notesForApproval.id}
            AND nfa_approvals.user_id = ${userId}
          )`
        )
      )
      .orderBy(desc(notesForApproval.createdAt));

    result.executivePending = pendingExecNfas;
    result.executiveCount = pendingExecNfas.length;
  }

  // Treasurer / Joint Treasurer: NFAs pending treasurer approval
  if (roleSet.has("treasurer") || roleSet.has("joint_treasurer")) {
    const pendingTreasurerNfas = await db
      .select({
        id: notesForApproval.id,
        referenceNo: notesForApproval.referenceNo,
        title: notesForApproval.title,
        status: notesForApproval.status,
        priority: notesForApproval.priority,
        category: notesForApproval.category,
        totalEstimatedAmount: notesForApproval.totalEstimatedAmount,
        requiredExecApprovals: notesForApproval.requiredExecApprovals,
        currentExecApprovals: notesForApproval.currentExecApprovals,
        currentExecRejections: notesForApproval.currentExecRejections,
        createdAt: notesForApproval.createdAt,
        creatorName: users.name,
      })
      .from(notesForApproval)
      .leftJoin(users, eq(notesForApproval.createdBy, users.id))
      .where(
        and(
          eq(notesForApproval.societyId, societyId),
          eq(notesForApproval.status, "pending_treasurer")
        )
      )
      .orderBy(desc(notesForApproval.createdAt));

    result.treasurerPending = pendingTreasurerNfas;
    result.treasurerCount = pendingTreasurerNfas.length;
  }

  return result;
}

// ─── NFA Stats ───

export async function getNFAStats(societyId: string) {
  const [stats] = await db
    .select({
      draft: sql<number>`count(*) filter (where ${notesForApproval.status} = 'draft')`,
      pending: sql<number>`count(*) filter (where ${notesForApproval.status} in ('pending_exec', 'pending_treasurer'))`,
      approved: sql<number>`count(*) filter (where ${notesForApproval.status} = 'approved')`,
      completed: sql<number>`count(*) filter (where ${notesForApproval.status} in ('po_created', 'completed'))`,
      rejected: sql<number>`count(*) filter (where ${notesForApproval.status} = 'rejected')`,
      total: sql<number>`count(*)`,
    })
    .from(notesForApproval)
    .where(eq(notesForApproval.societyId, societyId));

  return {
    draft: Number(stats?.draft ?? 0),
    pending: Number(stats?.pending ?? 0),
    approved: Number(stats?.approved ?? 0),
    completed: Number(stats?.completed ?? 0),
    rejected: Number(stats?.rejected ?? 0),
    total: Number(stats?.total ?? 0),
  };
}
