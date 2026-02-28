"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import * as hkService from "./housekeeping.service";

export async function getZonesList() {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");
  return hkService.getCleaningZones(session.societyId);
}

export async function addCleaningZone(data: {
  name: string;
  floor?: number;
  blockId?: string;
  zoneType?: string;
  frequency?: "daily" | "weekly" | "biweekly" | "monthly";
  description?: string;
}) {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");
  const result = await hkService.createCleaningZone({
    ...data,
    societyId: session.societyId,
  });
  revalidatePath("/staff/cleaning");
  return result;
}

export async function editCleaningZone(
  id: string,
  data: Partial<{
    name: string;
    floor: number;
    blockId: string;
    zoneType: string;
    frequency: "daily" | "weekly" | "biweekly" | "monthly";
    description: string;
    isActive: boolean;
  }>
) {
  const result = await hkService.updateCleaningZone(id, data);
  revalidatePath("/staff/cleaning");
  return result;
}

export async function getCleaningScheduleByDate(date: string) {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");
  return hkService.getCleaningSchedule(session.societyId, date);
}

export async function verifyCleaningLog(logId: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  const result = await hkService.verifyCleaning(logId, session.userId);
  revalidatePath("/staff/cleaning");
  return result;
}

export async function getSupplyRequestsList(filters?: { status?: string }) {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");
  return hkService.getSupplyRequests(session.societyId, filters);
}

export async function approveSupply(id: string, inventoryItemId?: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  const result = await hkService.approveSupplyRequest(
    id,
    session.userId,
    inventoryItemId
  );
  revalidatePath("/staff/supplies");
  return result;
}

export async function rejectSupply(id: string, notes?: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  const result = await hkService.rejectSupplyRequest(
    id,
    session.userId,
    notes
  );
  revalidatePath("/staff/supplies");
  return result;
}

export async function getCleaningDashboardStats() {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");
  return hkService.getCleaningStats(session.societyId);
}
