import type { Tables, Enums } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;
export type UserTier = Enums<"user_tier">;

export const USER_TIER_BADGE: Record<UserTier, { label: string; className: string }> = {
  STANDARD:       { label: "Starter",    className: "chip-info" },
  ENTERPRISE:     { label: "Growth",     className: "chip-info" },
  VIP:            { label: "Enterprise", className: "chip-success" },
  ANCHOR_PARTNER: { label: "Strategic",  className: "chip-warning" },
};
