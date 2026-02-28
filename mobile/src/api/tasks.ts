import api from "./client";

export async function getTasks(filters?: {
  status?: string;
  taskType?: string;
}) {
  const response = await api.get("/tasks", { params: filters });
  return response.data;
}

export async function getTask(taskId: string) {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data;
}

export async function updateTaskStatus(
  taskId: string,
  data: {
    status: string;
    resolution?: string;
    beforePhotoUrl?: string;
    afterPhotoUrl?: string;
  }
) {
  const response = await api.put(`/tasks/${taskId}/status`, data);
  return response.data;
}

export async function uploadTaskPhoto(
  taskId: string,
  data: { type: "before" | "after"; photoUrl: string }
) {
  const response = await api.post(`/tasks/${taskId}/photo`, data);
  return response.data;
}
