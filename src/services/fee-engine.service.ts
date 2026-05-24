// Fee Engine — computes the full escrow breakdown for a TXLOGPAY operation.
// Rates are configured by user tier and are the single source of truth for
// every UI breakdown, funding totals and future smart-contract settlement.

import type { UserTier } from "@/domain/user";
import type { EscrowBreakdown } from "@/types";

export interface FeeStructure {
  operational: number; // applied on gross_amount
  custody:     number; // applied on gross_amount
  settlement:  number; // applied on gross_amount
}

// Volume-based institutional pricing.
// STANDARD = Starter (up to USD 500k/mo)  → 1.50%
// ENTERPRISE = Growth (USD 500k–5M/mo)    → 1.25%
// VIP = Enterprise (above USD 5M/mo)      → 1.00%
// ANCHOR_PARTNER = Strategic              → 0.80%
// Single operational fee — custody and release are bundled.
export const TIER_FEES: Record<UserTier, FeeStructure> = {
  STANDARD:       { operational: 0.0150, custody: 0, settlement: 0 },
  ENTERPRISE:     { operational: 0.0125, custody: 0, settlement: 0 },
  VIP:            { operational: 0.0100, custody: 0, settlement: 0 },
  ANCHOR_PARTNER: { operational: 0.0080, custody: 0, settlement: 0 },
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export const feeEngine = {
  feesFor(tier: UserTier): FeeStructure {
    return TIER_FEES[tier];
  },

  /**
   * Compute the full escrow breakdown.
   *
   * total_funding       = gross + operational + custody + settlement
   *                       (importer deposits this as garantia)
   * net_exporter_amount = gross (importer's payable, paid 100% to exporter
   *                       on customs release; fees are TXLOGPAY's margin)
   */
  calculateBreakdown(grossAmount: number, tier: UserTier): EscrowBreakdown {
    const fees = TIER_FEES[tier];
    const gross = Math.max(0, grossAmount);
    const fee_amount      = round2(gross * fees.operational);
    const custody_fee     = round2(gross * fees.custody);
    const settlement_fee  = round2(gross * fees.settlement);
    const total_funding   = round2(gross + fee_amount + custody_fee + settlement_fee);
    return {
      gross_amount: round2(gross),
      fee_amount,
      custody_fee,
      settlement_fee,
      total_funding,
      net_exporter_amount: round2(gross),
    };
  },

  effectiveRate(tier: UserTier): number {
    const f = TIER_FEES[tier];
    return f.operational + f.custody + f.settlement;
  },
};
