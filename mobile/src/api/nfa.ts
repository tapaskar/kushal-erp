import { API_BASE_URL } from "../lib/constants";
import api from "./client";
import axios from "axios";
import { getToken } from "../lib/secure-storage";

const NFA_BASE = `${API_BASE_URL}/api/v1/mobile/nfa`;

async function authHeaders() {
  const token = await getToken();
  return { Authorization: `Bearer ${token}` };
}

export async function getNFAs(status?: string, limit?: number, offset?: number) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (limit) params.set("limit", String(limit));
  if (offset) params.set("offset", String(offset));
  const headers = await authHeaders();
  const response = await axios.get(`${NFA_BASE}?${params}`, { headers });
  return response.data;
}

export async function getNFADetail(nfaId: string) {
  const headers = await authHeaders();
  const response = await axios.get(`${NFA_BASE}/${nfaId}`, { headers });
  return response.data;
}

export async function createNFA(data: {
  title: string;
  description?: string;
  category?: string;
  priority?: string;
  items: Array<{
    itemName: string;
    specification?: string;
    quantity: number;
    unit?: string;
    l1VendorName?: string;
    l1UnitPrice?: number;
    l2VendorName?: string;
    l2UnitPrice?: number;
    l3VendorName?: string;
    l3UnitPrice?: number;
  }>;
}) {
  const headers = await authHeaders();
  const response = await axios.post(NFA_BASE, data, { headers });
  return response.data;
}

export async function submitNFA(nfaId: string) {
  const headers = await authHeaders();
  const response = await axios.post(`${NFA_BASE}/${nfaId}/submit`, {}, { headers });
  return response.data;
}

export async function approveNFA(nfaId: string, action: "approved" | "rejected", remarks?: string) {
  const headers = await authHeaders();
  const response = await axios.post(`${NFA_BASE}/${nfaId}/approve`, { action, remarks }, { headers });
  return response.data;
}

export async function createPOFromNFA(nfaId: string) {
  const headers = await authHeaders();
  const response = await axios.post(`${NFA_BASE}/${nfaId}/po`, {}, { headers });
  return response.data;
}

export async function completeNFA(nfaId: string) {
  const headers = await authHeaders();
  const response = await axios.post(`${NFA_BASE}/${nfaId}/complete`, {}, { headers });
  return response.data;
}

export async function getNFAStats() {
  const headers = await authHeaders();
  const response = await axios.get(`${NFA_BASE}/stats`, { headers });
  return response.data;
}

export async function getPendingApprovals() {
  const headers = await authHeaders();
  const response = await axios.get(`${NFA_BASE}/pending`, { headers });
  return response.data;
}
