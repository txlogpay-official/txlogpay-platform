export const USER_TIERS = ["STANDARD", "ENTERPRISE", "VIP", "ANCHOR_PARTNER"] as const;
export type UserTier = typeof USER_TIERS[number];

export const USER_TIER_LABELS: Record<UserTier, string> = {
  STANDARD:       "Starter",
  ENTERPRISE:     "Growth",
  VIP:            "Enterprise",
  ANCHOR_PARTNER: "Strategic",
};

export const KYC_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type KycStatus = typeof KYC_STATUSES[number];
