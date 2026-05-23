// Operation wizard store — holds the in-progress draft and active operation.
// Steps write into here through typed reducers; submit/load roundtrip via
// the service layer.

import { create } from "zustand";
import type { Operation, EscrowReservation, PaymentProof } from "@/types";
import type { Currency, Incoterm, ReleaseTrigger } from "@/domain/operation";

export interface CommercialDraft {
  incoterm: Incoterm | "";
  currency: Currency;
  operation_value: number;          // numeric (parsed)
  operation_value_input: string;    // masked string for the input
  release_trigger: ReleaseTrigger | "";
}

export interface DocumentationDraft {
  invoice_number: string;
  bl_awb: string;
  duimp: string;
  siscomex_reference: string;
}

export interface BeneficiaryDraft {
  exporter_name: string;
  bank_name: string;
  swift: string;
  iban: string;
  beneficiary_name: string;
  country: string;
  city: string;
}

export interface GuaranteeDraft {
  method: "pix" | "ted" | "swift";
  proof?: PaymentProof;
}

interface OperationState {
  commercial: CommercialDraft;
  documentation: DocumentationDraft;
  beneficiary: BeneficiaryDraft;
  guarantee: GuaranteeDraft;
  escrow: EscrowReservation | null;
  current: Operation | null;

  setCommercial: (patch: Partial<CommercialDraft>) => void;
  setDocumentation: (patch: Partial<DocumentationDraft>) => void;
  setBeneficiary: (patch: Partial<BeneficiaryDraft>) => void;
  setGuarantee: (patch: Partial<GuaranteeDraft>) => void;
  setEscrow: (escrow: EscrowReservation | null) => void;
  setCurrent: (op: Operation | null) => void;
  reset: () => void;
}

const initial = {
  commercial: {
    incoterm: "" as const,
    currency: "USD" as Currency,
    operation_value: 0,
    operation_value_input: "",
    release_trigger: "" as const,
  } satisfies CommercialDraft,
  documentation: {
    invoice_number: "", bl_awb: "", duimp: "", siscomex_reference: "",
  } satisfies DocumentationDraft,
  beneficiary: {
    exporter_name: "", bank_name: "", swift: "", iban: "",
    beneficiary_name: "", country: "", city: "",
  } satisfies BeneficiaryDraft,
  guarantee: { method: "pix" as const } satisfies GuaranteeDraft,
  escrow: null,
  current: null,
};

export const useOperationStore = create<OperationState>((set) => ({
  ...initial,
  setCommercial: (patch) => set((s) => ({ commercial: { ...s.commercial, ...patch } })),
  setDocumentation: (patch) => set((s) => ({ documentation: { ...s.documentation, ...patch } })),
  setBeneficiary: (patch) => set((s) => ({ beneficiary: { ...s.beneficiary, ...patch } })),
  setGuarantee: (patch) => set((s) => ({ guarantee: { ...s.guarantee, ...patch } })),
  setEscrow: (escrow) => set({ escrow }),
  setCurrent: (current) => set({ current }),
  reset: () => set({ ...initial }),
}));
