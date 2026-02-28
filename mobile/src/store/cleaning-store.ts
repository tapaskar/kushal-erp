import { create } from "zustand";
import type { CleaningLog, SupplyRequest } from "../lib/types";
import * as cleaningApi from "../api/cleaning";

interface CleaningState {
  schedule: any[];
  supplies: any[];
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
    const schedule = get().schedule.map((item: any) =>
      (item.log?.id || item.id) === logId
        ? { ...item, log: { ...item.log, status: "in_progress", startedAt: new Date().toISOString() } }
        : item
    );
    set({ schedule });
  },

  fetchSupplies: async () => {
    try {
      const data = await cleaningApi.getSupplyRequests();
      set({ supplies: data.requests.map((r: any) => r.request || r) });
    } catch {
      // Keep existing state
    }
  },
}));
