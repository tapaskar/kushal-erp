"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import * as securityService from "./security.service";

export async function getVisitorLogsList(filters?: {
  date?: string;
  status?: string;
}) {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");
  return securityService.getVisitorLogs(session.societyId, filters);
}

export async function getActiveVisitorsList() {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");
  return securityService.getActiveVisitors(session.societyId);
}

export async function getIncidentsList(filters?: {
  status?: string;
  severity?: string;
}) {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");
  return securityService.getIncidents(session.societyId, filters);
}

export async function updateIncident(
  id: string,
  status: "reported" | "investigating" | "resolved" | "escalated",
  resolution?: string
) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  const result = await securityService.updateIncidentStatus(
    id,
    status,
    resolution,
    session.userId
  );
  revalidatePath("/staff/incidents");
  return result;
}

export async function getSosAlertsList() {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");
  return securityService.getActiveSosAlerts(session.societyId);
}

export async function resolveSos(id: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  const result = await securityService.resolveSosAlert(id, session.userId);
  revalidatePath("/staff/sos");
  return result;
}

export async function getSecurityDashboardStats() {
  const session = await getSession();
  if (!session?.societyId) throw new Error("Unauthorized");
  return securityService.getSecurityStats(session.societyId);
}
