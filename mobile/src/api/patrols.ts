import api from "./client";

export async function getPatrolLogs() {
  const response = await api.get("/patrols");
  return response.data;
}

export async function getPatrolLog(patrolLogId: string) {
  const response = await api.get(`/patrols/${patrolLogId}`);
  return response.data;
}

export async function startPatrol(patrolLogId: string) {
  const response = await api.post(`/patrols/${patrolLogId}/start`);
  return response.data;
}

export async function recordCheckpoint(
  patrolLogId: string,
  data: {
    checkpointIndex: number;
    label: string;
    latitude?: number;
    longitude?: number;
    photoUrl?: string;
    beaconDetected?: boolean;
    notes?: string;
  }
) {
  const response = await api.post(
    `/patrols/${patrolLogId}/checkpoint`,
    data
  );
  return response.data;
}

export async function completePatrol(patrolLogId: string) {
  const response = await api.post(`/patrols/${patrolLogId}/complete`);
  return response.data;
}
