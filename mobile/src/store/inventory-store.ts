import { create } from "zustand";
import type { InventoryItem } from "../lib/types";
import * as inventoryApi from "../api/inventory";

interface InventoryState {
  items: InventoryItem[];
  loading: boolean;
  searchItems: (query: string) => Promise<void>;
  searchByBarcode: (barcode: string) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  items: [],
  loading: false,

  searchItems: async (query: string) => {
    set({ loading: true });
    try {
      const data = await inventoryApi.searchInventory(query);
      set({ items: data.items });
    } catch {
      set({ items: [] });
    } finally {
      set({ loading: false });
    }
  },

  searchByBarcode: async (barcode: string) => {
    set({ loading: true });
    try {
      const data = await inventoryApi.searchInventory(undefined, barcode);
      set({ items: data.items });
    } catch {
      set({ items: [] });
    } finally {
      set({ loading: false });
    }
  },
}));
