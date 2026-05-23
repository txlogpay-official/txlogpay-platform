// Strong typing for the TXLOGPAY operational domain.
// 1:1 mappable to future Supabase tables.

import type { Currency, Incoterm, OperationStatus, ReleaseTrigger, EventSource } from "@/domain/operation";
import type { UserTier, KycStatus } from "@/domain/user";
import type { ReservationStatus, PaymentValidationStatus, AnchorProvider } from "@/domain/escrow";

export interface User {
  id: string;
  name: string;
  email: string;
  company_name: string;
  country: string;
  user_tier: UserTier;
  kyc_status: KycStatus;
  created_at: string;
}

export interface Beneficiary {
  id: string;
  operation_id: string;
  exporter_name: string;
  bank_name: string;
  swift: string;
  iban: string;
  beneficiary_name: string;
  country: string;
  city: string;
}

export interface PaymentProof {
  id: string;
  operation_id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  validation_status: PaymentValidationStatus;
  uploaded_at: string;
}

export interface EscrowBreakdown {
  gross_amount: number;       // valor protegido
  fee_amount: number;         // fee operacional
  custody_fee: number;        // taxa de custódia
  settlement_fee: number;     // taxa de liquidação
  total_funding: number;      // total a depositar como garantia
  net_exporter_amount: number;// valor líquido recebido pelo exportador
}

export interface EscrowReservation extends EscrowBreakdown {
  id: string;
  operation_id: string;
  currency: Currency;
  anchor_provider: AnchorProvider;
  reservation_status: ReservationStatus;
  created_at: string;
}

export interface OperationEvent {
  id: string;
  operation_id: string;
  event_type: string;
  description: string;
  timestamp: string;
  source: EventSource;
}

export interface Operation {
  id: string;
  user_id: string | null;
  operation_code: string;
  siscomex_reference: string;
  duimp: string;
  invoice_number: string;
  bl_awb: string;
  incoterm: Incoterm;
  currency: Currency;
  operation_value: number;
  release_trigger: ReleaseTrigger;
  status: OperationStatus;
  created_at: string;
  // Aggregates (denormalised for UI; in Supabase they live in joined tables)
  beneficiary?: Beneficiary;
  escrow?: EscrowReservation;
  events: OperationEvent[];
  payment_proofs: PaymentProof[];
}

// Re-exports for convenience
export type { Currency, Incoterm, OperationStatus, ReleaseTrigger, EventSource,
  UserTier, KycStatus, ReservationStatus, PaymentValidationStatus, AnchorProvider };
