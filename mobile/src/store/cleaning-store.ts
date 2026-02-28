import { create } from "zustand";
import type { CleaningLog, SupplyRequest } from "../lib/types";
import * as cleaningApi from "../api/cleaning";

export interface CleaningScheduleItem {
  log: CleaningLog;
  zone: { id: string; name: string; floor?: number; zoneType: string };
  // Flattened fields from API response
  id?: string;
  zoneName?: string;
  zoneType?: string;
  zoneFloor?: number | null;
}

interface CleaningState {
  schedule: CleaningScheduleItem[];
  supplies: SupplyRequest[];
  loading: boolean;
  fetchSchedule: (date?: string) => Promise<void>;
  startCleaning: (logId: string) => Promise<void>;
  fetchSupplies: () => Promise<void>;
}

export const useCleaningStore = create<CleaningState>((set, get) => ({
  schedule: [],
  supplies: [],
  loading: false,

  fetchSchedule: async (date?: string) => {
    set({ loading: true });
    try {
      const data = await cleaningApi.getCleaningSchedule(date);
      set({ schedule: data.schedule });
    } catch {
      // Keep existing state
    } finally {
      set({ loading: false });
    }
  },

  startCleaning: async (logId: string) => {
    await cleaningApi.startCleaning(logId);
    const schedule = get().schedule.map((item) =>
      item.log.id === logId
        ? { ...item, log: { ...item.log, status: "in_progress" as const, startedAt: new Date().toISOString() } }
        : item
    );
    set({ schedule });
  },

  fetchSupplies: async () => {
    try {
      const data = await cleaningApi.getSupplyRequests();
      set({ supplies: data.requests.map((r: { request?: SupplyRequest } & SupplyRequest) => r.request || r) });
    } catch {
      // Keep existing state
    }
  },
}));
