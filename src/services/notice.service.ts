"use server";

import { db } from "@/db";
import { announcements, users } from "@/db/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";

export async function getNotices(societyId: string) {
  return db
    .select({
      notice: announcements,
      author: {
        name: users.name,
      },
    })
    .from(announcements)
    .leftJoin(users, eq(announcements.createdBy, users.id))
    .where(eq(announcements.societyId, societyId))
    .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
}

export async function createNotice(data: {
  societyId: string;
  title: string;
  body: string;
  category?: "general" | "maintenance" | "meeting" | "event" | "emergency" | "financial" | "rule_update";
  isPinned?: boolean;
  sendEmail?: boolean;
  sendWhatsapp?: boolean;
}) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const [notice] = await db
    .insert(announcements)
    .values({
      ...data,
      publishedAt: new Date(),
      createdBy: session.userId,
    })
    .returning();

  // TODO: If sendEmail/sendWhatsapp, queue notifications via SES/WhatsApp API
  if (data.sendEmail) {
    console.log("[Notice] Email distribution queued for:", notice.id);
  }
  if (data.sendWhatsapp) {
    console.log("[Notice] WhatsApp distribution queued for:", notice.id);
  }

  revalidatePath("/notices");
  return notice;
}

export async function deleteNotice(noticeId: string) {
  await db.delete(announcements).where(eq(announcements.id, noticeId));
  revalidatePath("/notices");
}

export async function togglePin(noticeId: string, isPinned: boolean) {
  await db
    .update(announcements)
    .set({ isPinned, updatedAt: new Date() })
    .where(eq(announcements.id, noticeId));
  revalidatePath("/notices");
}
