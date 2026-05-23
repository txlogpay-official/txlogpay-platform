// Mock Stellar Anchor — simulates funding reservation, FX quote and settlement.
// Will be replaced by SEP-24 / SEP-31 Anchor calls.

import type { Currency } from "@/domain/operation";

export interface AnchorQuote {
  rate: number;       // BRL per unit of target currency
  fee_bps: number;    // spread in basis points
  expires_at: string; // ISO
}

export const mockAnchor = {
  async getQuote(currency: Currency): Promise<AnchorQuote> {
    await new Promise((r) => setTimeout(r, 250));
    const baseRates: Record<Currency, number> = {
      USD: 5.42, EUR: 5.88, BRL: 1.0, CNY: 0.74, GBP: 6.92,
    };
    return {
      rate: baseRates[currency],
      fee_bps: 80,
      expires_at: new Date(Date.now() + 5 * 60_000).toISOString(),
    };
  },

  async reserveFunding(opId: string, amount: number): Promise<{ reservation_id: string }> {
    await new Promise((r) => setTimeout(r, 400));
    return { reservation_id: `anchor_${opId}_${amount.toFixed(0)}` };
  },

  async releaseSettlement(reservation_id: string): Promise<{ tx_hash: string }> {
    await new Promise((r) => setTimeout(r, 600));
    return {
      tx_hash: `stellar_${reservation_id}_${Date.now().toString(36)}`,
    };
  },
};
