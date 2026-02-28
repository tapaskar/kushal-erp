import { create } from "zustand";
import type { Shift } from "../lib/types";
import * as shiftsApi from "../api/shifts";

interface ShiftState {
  currentShift: Shift | null;
  shifts: Shift[];
  isLoading: boolean;

  fetchCurrentShift: () => Promise<void>;
  fetchShifts: (from?: string, to?: string) => Promise<void>;
  performCheckIn: (data: {
    shiftId: string;
    lat: string;
    lng: string;
    photoUrl?: string;
  }) => Promise<void>;
  performCheckOut: (data: {
    shiftId: string;
    lat: string;
    lng: string;
    photoUrl?: string;
  }) => Promise<void>;
}

export const useShiftStore = create<ShiftState>((set) => ({
  currentShift: null,
  shifts: [],
  isLoading: false,

  fetchCurrentShift: async () => {
    try {
      const data = await shiftsApi.getCurrentShift();
      set({ currentShift: data.shift || null });
    } catch {
      set({ currentShift: null });
    }
  },

  fetchShifts: async (from?: string, to?: string) => {
    set({ isLoading: true });
    try {
      const data = await shiftsApi.getShifts(from, to);
      set({ shifts: data.shifts || [], isLoading: false });
    } catch {
      set({ shifts: [], isLoading: false });
    }
  },

  performCheckIn: async (data) => {
    const result = await shiftsApi.checkIn(data);
    set({ currentShift: result.shift });
  },

  performCheckOut: async (data) => {
    const result = await shiftsApi.checkOut(data);
    set({ currentShift: result.shift });
  },
}));
