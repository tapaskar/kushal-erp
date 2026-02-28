import { create } from "zustand";
import type { StaffProfile, Society } from "../lib/types";
import { setToken, removeToken, getToken } from "../lib/secure-storage";
import * as authApi from "../api/auth";

interface AuthState {
  token: string | null;
  staff: StaffProfile | null;
  society: Society | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  initialize: () => Promise<void>;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateConsent: (consent: boolean) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  staff: null,
  society: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      const token = await getToken();
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      set({ token });
      const data = await authApi.getMe();
      set({
        staff: data.staff,
        society: data.society,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      await removeToken();
      set({
        token: null,
        staff: null,
        society: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  login: async (phone: string, password: string) => {
    const data = await authApi.login(phone, password);
    await setToken(data.token);
    set({
      token: data.token,
      staff: data.staff,
      isAuthenticated: true,
    });

    // Fetch full profile
    const profile = await authApi.getMe();
    set({ staff: profile.staff, society: profile.society });
  },

  logout: async () => {
    await removeToken();
    set({
      token: null,
      staff: null,
      society: null,
      isAuthenticated: false,
    });
  },

  refreshProfile: async () => {
    const data = await authApi.getMe();
    set({ staff: data.staff, society: data.society });
  },

  updateConsent: async (consent: boolean) => {
    await authApi.updateConsent(consent);
    const current = get().staff;
    if (current) {
      set({
        staff: {
          ...current,
          consentGiven: consent,
          consentRevokedAt: consent ? undefined : new Date().toISOString(),
        },
      });
    }
  },
}));
