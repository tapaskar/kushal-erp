import api from "./client";

export async function getCleaningSchedule(date?: string) {
  const response = await api.get("/cleaning", { params: { date } });
  return response.data;
}

export async function startCleaning(logId: string) {
  const response = await api.put(`/cleaning/${logId}/start`);
  return response.data;
}

export async function completeCleaning(logId: string, data: {
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  notes?: string;
}) {
  const response = await api.put(`/cleaning/${logId}/complete`, data);
  return response.data;
}

export async function getSupplyRequests(status?: string) {
  const response = await api.get("/supplies", { params: { status } });
  return response.data;
}

export async function createSupplyRequest(data: {
  itemName: string;
  quantity?: number;
  urgency?: string;
  reason?: string;
}) {
  const response = await api.post("/supplies", data);
  return response.data;
}
