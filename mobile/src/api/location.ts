import api from "./client";
import type { LocationPoint } from "../lib/types";

export async function batchUploadLocations(points: LocationPoint[]) {
  const response = await api.post("/location/batch", { points });
  return response.data;
}

export async function getBeacons() {
  const response = await api.get("/beacons");
  return response.data;
}

export async function batchUploadBeaconEvents(
  events: {
    beaconId: string;
    shiftId?: string;
    eventType: string;
    rssi?: number;
    dwellSeconds?: number;
    recordedAt: string;
  }[]
) {
  const response = await api.post("/beacons/events", { events });
  return response.data;
}

export async function recordQrScan(beaconId: string) {
  const response = await api.post("/beacons/scan", { beaconId });
  return response.data;
}

export async function getUploadUrl(purpose: string) {
  const response = await api.post("/upload", { purpose });
  return response.data;
}
