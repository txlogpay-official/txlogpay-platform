import { create } from "zustand";
import type { User } from "@/types";
import type { UserTier } from "@/domain/user";

interface UserState {
  user: User | null;
  tier: UserTier;
  setUser: (user: User | null) => void;
  setTier: (tier: UserTier) => void;
}

// Default tier for the demo. In production this comes from Supabase.
export const useUserStore = create<UserState>((set) => ({
  user: null,
  tier: "STANDARD",
  setUser: (user) => set({ user, tier: user?.user_tier ?? "STANDARD" }),
  setTier: (tier) => set({ tier }),
}));
