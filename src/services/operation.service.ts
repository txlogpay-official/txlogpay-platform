// Operation Service — CRUD with localStorage persistence.
// Mirrors the future Supabase `operations` + related tables surface.

import type { Operation, Beneficiary, EscrowReservation, PaymentProof } from "@/types";
import type { Currency, Incoterm, ReleaseTrigger, OperationStatus } from "@/domain/operation";
import { eventEngine } from "./event-engine.service";

const STORAGE_KEY = "txlogpay.operations.v2";

function readAll(): Operation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Operation[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: Operation[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function uid(prefix = "op") {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function makeOperationCode() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `TX-${n}`;
}

export interface CreateOperationInput {
  user_id: string | null;
  incoterm: Incoterm;
  currency: Currency;
  operation_value: number;
  release_trigger: ReleaseTrigger;
  duimp: string;
  invoice_number: string;
  bl_awb: string;
  siscomex_reference: string;
  beneficiary?: Beneficiary;
  escrow?: EscrowReservation;
  payment_proofs?: PaymentProof[];
  status?: OperationStatus;
}

export const operationService = {
  async create(input: CreateOperationInput): Promise<Operation> {
    await new Promise((r) => setTimeout(r, 500));
    const id = uid();
    const base: Operation = {
      id,
      user_id: input.user_id,
      operation_code: makeOperationCode(),
      siscomex_reference: input.siscomex_reference,
      duimp: input.duimp,
      invoice_number: input.invoice_number,
      bl_awb: input.bl_awb,
      incoterm: input.incoterm,
      currency: input.currency,
      operation_value: input.operation_value,
      release_trigger: input.release_trigger,
      status: input.status ?? "PENDING_FUNDING",
      created_at: new Date().toISOString(),
      beneficiary: input.beneficiary,
      escrow: input.escrow,
      events: [],
      payment_proofs: input.payment_proofs ?? [],
    };
    const op = eventEngine.bootstrap(base);
    const all = readAll();
    all.unshift(op);
    writeAll(all);
    return op;
  },

  async update(id: string, patch: Partial<Operation>): Promise<Operation | null> {
    const all = readAll();
    const idx = all.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    const updated = { ...all[idx], ...patch };
    all[idx] = updated;
    writeAll(all);
    return updated;
  },

  async list(): Promise<Operation[]> {
    return readAll();
  },

  async get(id: string): Promise<Operation | null> {
    return readAll().find((o) => o.id === id) ?? null;
  },
};
