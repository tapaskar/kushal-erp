import { create } from "zustand";
import type { VisitorLog } from "../lib/types";
import * as visitorsApi from "../api/visitors";

interface VisitorState {
  visitors: VisitorLog[];
  loading: boolean;
  fetchVisitors: (date?: string) => Promise<void>;
  checkoutVisitor: (id: string) => Promise<void>;
}

export const useVisitorStore = create<VisitorState>((set, get) => ({
  visitors: [],
  loading: false,

  fetchVisitors: async (date?: string) => {
    set({ loading: true });
    try {
      const data = await visitorsApi.getVisitors({ date });
      set({ visitors: data.visitors.map((v: { visitor?: VisitorLog } & VisitorLog) => v.visitor || v) });
    } catch {
      // Keep existing state on error
    } finally {
      set({ loading: false });
    }
  },

  checkoutVisitor: async (id: string) => {
    await visitorsApi.checkoutVisitor(id);
    const visitors = get().visitors.map((v) =>
      v.id === id ? { ...v, status: "checked_out" as const, checkOutAt: new Date().toISOString() } : v
    );
    set({ visitors });
  },
}));
