import { useMemo } from "react";
import { feeEngine } from "@/services/fee-engine.service";
import { useUserStore } from "@/stores/user.store";
import type { EscrowBreakdown } from "@/types";

export function useFeeBreakdown(grossAmount: number): EscrowBreakdown & { effective_rate: number } {
  const tier = useUserStore((s) => s.tier);
  return useMemo(() => {
    const breakdown = feeEngine.calculateBreakdown(grossAmount, tier);
    return { ...breakdown, effective_rate: feeEngine.effectiveRate(tier) };
  }, [grossAmount, tier]);
}
