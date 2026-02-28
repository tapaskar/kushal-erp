import api from "./client";

export async function getVisitors(filters?: { date?: string; status?: string }) {
  const response = await api.get("/visitors", { params: filters });
  return response.data;
}

export async function createVisitor(data: {
  visitorName: string;
  visitorPhone?: string;
  visitorType?: string;
  unitId?: string;
  purpose?: string;
  vehicleNumber?: string;
  photoUrl?: string;
  checkInGate?: string;
  notes?: string;
}) {
  const response = await api.post("/visitors", data);
  return response.data;
}

export async function checkoutVisitor(id: string, data?: {
  checkOutGate?: string;
  notes?: string;
}) {
  const response = await api.put(`/visitors/${id}/checkout`, data || {});
  return response.data;
}
