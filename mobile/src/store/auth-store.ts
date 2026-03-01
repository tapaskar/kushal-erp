import { create } from "zustand";
import type { StaffProfile, Society, UserProfile } from "../lib/types";
import { setToken, removeToken, getToken } from "../lib/secure-storage";
import * as authApi from "../api/auth";

interface AuthState {
  token: string | null;
  userType: "staff" | "user" | null;
  staff: StaffProfile | null;
  user: UserProfile | null;
  society: Society | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;

  initialize: () => Promise<void>;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateConsent: (consent: boolean) => Promise<void>;
  hasPermission: (perm: string) => boolean;
  isStaff: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  userType: null,
  staff: null,
  user: null,
  society: null,
  permissions: [],
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

      if (data.userType === "user") {
        set({
          userType: "user",
          user: data.user,
          society: data.society,
          permissions: data.permissions || [],
          staff: null,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          userType: "staff",
          staff: data.staff,
          society: data.society,
          permissions: data.permissions || [],
          user: null,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch {
      await removeToken();
      set({
        token: null,
        userType: null,
        staff: null,
        user: null,
        society: null,
        permissions: [],
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  login: async (phone: string, password: string) => {
    const data = await authApi.login(phone, password);
    await setToken(data.token);

    if (data.userType === "user") {
      set({
        token: data.token,
        userType: "user",
        user: data.user,
        staff: null,
        isAuthenticated: true,
      });
    } else {
      set({
        token: data.token,
        userType: "staff",
        staff: data.staff,
        user: null,
        isAuthenticated: true,
      });
    }

    // Fetch full profile
    const profile = await authApi.getMe();
    if (profile.userType === "user") {
      set({
        userType: "user",
        user: profile.user,
        society: profile.society,
        permissions: profile.permissions || [],
        staff: null,
      });
    } else {
      set({
        userType: "staff",
        staff: profile.staff,
        society: profile.society,
        permissions: profile.permissions || [],
        user: null,
      });
    }
  },

  logout: async () => {
    await removeToken();
    set({
      token: null,
      userType: null,
      staff: null,
      user: null,
      society: null,
      permissions: [],
      isAuthenticated: false,
    });
  },

  refreshProfile: async () => {
    const data = await authApi.getMe();
    if (data.userType === "user") {
      set({
        userType: "user",
        user: data.user,
        society: data.society,
        permissions: data.permissions || [],
        staff: null,
      });
    } else {
      set({
        userType: "staff",
        staff: data.staff,
        society: data.society,
        permissions: data.permissions || [],
        user: null,
      });
    }
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

  hasPermission: (perm: string) => {
    return get().permissions.includes(perm);
  },

  isStaff: () => {
    return get().userType === "staff";
  },

  isAdmin: () => {
    const state = get();
    return (
      state.userType === "user" &&
      (state.user?.role === "society_admin" || state.user?.role === "estate_manager")
    );
  },
}));
