import api from "./client";

export async function getShifts(from?: string, to?: string) {
  const params: Record<string, string> = {};
  if (from) params.from = from;
  if (to) params.to = to;
  const response = await api.get("/shifts", { params });
  return response.data;
}

export async function getCurrentShift() {
  const response = await api.get("/shifts/current");
  return response.data;
}

export async function checkIn(data: {
  shiftId: string;
  lat: string;
  lng: string;
  photoUrl?: string;
}) {
  const response = await api.post("/shifts/check-in", data);
  return response.data;
}

export async function checkOut(data: {
  shiftId: string;
  lat: string;
  lng: string;
  photoUrl?: string;
}) {
  const response = await api.post("/shifts/check-out", data);
  return response.data;
}
