import api from "./client";

export async function getIncidents() {
  const response = await api.get("/incidents");
  return response.data;
}

export async function createIncident(data: {
  severity?: string;
  title: string;
  description?: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  photoUrls?: string[];
}) {
  const response = await api.post("/incidents", data);
  return response.data;
}

export async function triggerSos(data: {
  latitude?: string;
  longitude?: string;
  message?: string;
}) {
  const response = await api.post("/sos", data);
  return response.data;
}
