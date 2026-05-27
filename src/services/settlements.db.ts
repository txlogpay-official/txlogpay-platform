import { supabase } from "@/integrations/supabase/client";
import { executeSettlement as executeSettlementFn } from "@/lib/settlement.functions";

export type Settlement = {
  id: string;
  operation_id: string;
  user_id: string;
  tx_hash: string;
  ledger: number | null;
  amount: number;
  asset: string;
  asset_code: string | null;
  operation_currency: string | null;
  source_wallet: string | null;
  destination_wallet: string;
  confirmation_code: string | null;
  network: string;
  status: string;
  successful: boolean;
  created_at: string;
};

export const settlementsDb = {
  async getByOperation(operationId: string): Promise<Settlement | null> {
    const { data, error } = await supabase
      .from("settlements" as never)
      .select("*")
      .eq("operation_id", operationId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return null;
    return (data as unknown as Settlement) ?? null;
  },

  /**
   * Dispara a liquidação tokenizada (server fn). Toda lógica Stellar
   * — trustlines, transferência do asset operacional, persistência —
   * acontece no servidor.
   */
  async createForOperation(operationId: string): Promise<Settlement> {
    const result = await executeSettlementFn({ data: { operationId } });
    return result as unknown as Settlement;
  },
};
