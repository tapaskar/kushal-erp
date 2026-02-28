import api from "./client";

export async function searchInventory(query?: string, barcode?: string) {
  const response = await api.get("/inventory/search", {
    params: { q: query, barcode },
  });
  return response.data;
}

export async function recordStock(
  itemId: string,
  data: {
    movementType: "stock_in" | "stock_out";
    reason: string;
    quantity: number;
    notes?: string;
  }
) {
  const response = await api.post(`/inventory/${itemId}/stock`, data);
  return response.data;
}

export async function getMaterialsForTask(taskId: string) {
  const response = await api.get(`/tasks/${taskId}/materials`);
  return response.data;
}

export async function logMaterialUsage(
  taskId: string,
  data: {
    inventoryItemId: string;
    quantityUsed: number;
    notes?: string;
  }
) {
  const response = await api.post(`/tasks/${taskId}/materials`, data);
  return response.data;
}

export async function getReportsSummary() {
  const response = await api.get("/reports/summary");
  return response.data;
}
