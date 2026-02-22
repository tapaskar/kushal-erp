"use server";

import { db } from "@/db";
import { vendors, vendorCategories, users, societies } from "@/db/schema";
import { eq, and, desc, asc, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";

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

// ─── Queries ───

export async function getVendors(
  societyId: string,
  filters?: { status?: string; vendorType?: string }
) {
  const conditions = [
    eq(vendors.societyId, societyId),
    eq(vendors.isActive, true),
  ];

  if (filters?.status) {
    conditions.push(
      eq(
        vendors.status,
        filters.status as "pending" | "approved" | "suspended" | "blacklisted"
      )
    );
  }
  if (filters?.vendorType) {
    conditions.push(
      eq(
        vendors.vendorType,
        filters.vendorType as "product" | "service"
      )
    );
  }

  const vendorList = await db
    .select({
      vendor: vendors,
      createdByUser: { name: users.name },
    })
    .from(vendors)
    .leftJoin(users, eq(vendors.createdBy, users.id))
    .where(and(...conditions))
    .orderBy(asc(vendors.name));

  // Fetch categories for all vendors
  const vendorIds = vendorList.map((v) => v.vendor.id);
  const categories =
    vendorIds.length > 0
      ? await db
          .select()
          .from(vendorCategories)
          .where(inArray(vendorCategories.vendorId, vendorIds))
      : [];

  const categoryMap = new Map<string, VendorCategory[]>();
  for (const cat of categories) {
    const list = categoryMap.get(cat.vendorId) || [];
    list.push(cat.category as VendorCategory);
    categoryMap.set(cat.vendorId, list);
  }

  return vendorList.map((v) => ({
    ...v,
    categories: categoryMap.get(v.vendor.id) || [],
  }));
}

export async function getVendorById(id: string) {
  const [result] = await db
    .select({
      vendor: vendors,
      createdByUser: { name: users.name },
    })
    .from(vendors)
    .leftJoin(users, eq(vendors.createdBy, users.id))
    .where(eq(vendors.id, id))
    .limit(1);

  if (!result) return null;

  const categories = await db
    .select()
    .from(vendorCategories)
    .where(eq(vendorCategories.vendorId, id));

  return {
    ...result,
    categories: categories.map((c) => c.category as VendorCategory),
  };
}

export async function getVendorsByCategory(
  societyId: string,
  category: VendorCategory
) {
  // Find vendors that serve this category AND are approved
  const catRows = await db
    .select({ vendorId: vendorCategories.vendorId })
    .from(vendorCategories)
    .where(eq(vendorCategories.category, category));

  const vendorIds = catRows.map((r) => r.vendorId);
  if (vendorIds.length === 0) return [];

  return db
    .select()
    .from(vendors)
    .where(
      and(
        eq(vendors.societyId, societyId),
        eq(vendors.status, "approved"),
        eq(vendors.isActive, true),
        inArray(vendors.id, vendorIds)
      )
    )
    .orderBy(asc(vendors.name));
}

export async function getVendorStats(societyId: string) {
  const [stats] = await db
    .select({
      total: sql<number>`count(*)`,
      pending: sql<number>`count(*) filter (where ${vendors.status} = 'pending')`,
      approved: sql<number>`count(*) filter (where ${vendors.status} = 'approved')`,
      suspended: sql<number>`count(*) filter (where ${vendors.status} = 'suspended')`,
    })
    .from(vendors)
    .where(and(eq(vendors.societyId, societyId), eq(vendors.isActive, true)));

  return stats;
}

// ─── Mutations ───

export async function createVendor(data: {
  societyId: string;
  name: string;
  contactPerson?: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  gstin?: string;
  pan?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  vendorType: "product" | "service";
  notes?: string;
  categories: VendorCategory[];
}) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  return db.transaction(async (tx) => {
    const [vendor] = await tx
      .insert(vendors)
      .values({
        societyId: data.societyId,
        name: data.name,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        gstin: data.gstin,
        pan: data.pan,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
        vendorType: data.vendorType,
        notes: data.notes,
        createdBy: session.userId,
      })
      .returning();

    if (data.categories.length > 0) {
      await tx.insert(vendorCategories).values(
        data.categories.map((cat) => ({
          vendorId: vendor.id,
          category: cat,
        }))
      );
    }

    revalidatePath("/vendors");
    return vendor;
  });
}

/** Public — no auth. Used by the vendor self-registration portal. */
export async function getSocietyForVendorPortal(societyId: string) {
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(societyId)) return null;

  const [row] = await db
    .select({ id: societies.id, name: societies.name, city: societies.city })
    .from(societies)
    .where(eq(societies.id, societyId))
    .limit(1);

  return row ?? null;
}

/** Public — no auth. Vendor self-registration; status defaults to "pending". */
export async function registerVendorPublic(
  societyId: string,
  data: {
    name: string;
    contactPerson?: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    gstin?: string;
    pan?: string;
    vendorType: "product" | "service";
    notes?: string;
    categories: VendorCategory[];
  }
) {
  const society = await getSocietyForVendorPortal(societyId);
  if (!society) throw new Error("Invalid registration link");
  if (data.categories.length === 0) throw new Error("Select at least one category");

  return db.transaction(async (tx) => {
    const [vendor] = await tx
      .insert(vendors)
      .values({
        societyId,
        name: data.name,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        gstin: data.gstin,
        pan: data.pan,
        vendorType: data.vendorType,
        notes: data.notes,
        // status defaults to "pending" in the schema
      })
      .returning();

    await tx.insert(vendorCategories).values(
      data.categories.map((cat) => ({ vendorId: vendor.id, category: cat }))
    );

    return vendor;
  });
}

export async function updateVendor(
  id: string,
  data: Partial<{
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    gstin: string;
    pan: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    notes: string;
    categories: VendorCategory[];
  }>
) {
  const { categories, ...vendorData } = data;

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(vendors)
      .set({ ...vendorData, updatedAt: new Date() })
      .where(eq(vendors.id, id))
      .returning();

    if (categories !== undefined) {
      // Replace all categories
      await tx
        .delete(vendorCategories)
        .where(eq(vendorCategories.vendorId, id));

      if (categories.length > 0) {
        await tx.insert(vendorCategories).values(
          categories.map((cat) => ({ vendorId: id, category: cat }))
        );
      }
    }

    revalidatePath("/vendors");
    revalidatePath(`/vendors/${id}`);
    return updated;
  });
}

export async function updateVendorStatus(
  id: string,
  status: "pending" | "approved" | "suspended" | "blacklisted"
) {
  const [updated] = await db
    .update(vendors)
    .set({ status, updatedAt: new Date() })
    .where(eq(vendors.id, id))
    .returning();

  revalidatePath("/vendors");
  revalidatePath(`/vendors/${id}`);
  return updated;
}
