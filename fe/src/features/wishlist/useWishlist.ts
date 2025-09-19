// fe/src/features/wishlist/useWishlist.ts
import { create } from "zustand";
import { apiFetch } from "../../lib/api1";

type WishState = {
  ids: Set<string>;
  loaded: boolean;
  init: () => Promise<void>;
  toggle: (id: string) => Promise<boolean>;
  check: (id: string) => Promise<boolean>;
};

export const useWishlist = create<WishState>((set, get) => ({
  ids: new Set(),
  loaded: false,
  init: async () => {
    try {
      const data = await apiFetch("/wishlist");
      const ids = new Set<string>(data.products.map((p: any) => p.id));
      set({ ids, loaded: true });
    } catch { set({ loaded: true }); }
  },
  toggle: async (id: string) => {
    const { liked } = await apiFetch(`/wishlist/${id}`, { method: "POST" });
    set(s => {
      const next = new Set(s.ids);
      liked ? next.add(id) : next.delete(id);
      return { ids: next };
    });
    return liked;
  },
  check: async (id: string) => {
    const { liked } = await apiFetch(`/wishlist/check/${id}`);
    set(s => {
      const next = new Set(s.ids);
      liked ? next.add(id) : next.delete(id);
      return { ids: next };
    });
    return liked;
  }
}));
