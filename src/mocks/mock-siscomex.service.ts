// Mock Siscomex integration — simulates the customs event stream
// (CARGO_SHIPPED → IN_TRANSIT → CUSTOMS_ARRIVAL → CUSTOMS_RELEASED).
// Returns the events the real Siscomex API will emit.

import type { OperationEvent } from "@/types";
import { eventEngine } from "@/services/event-engine.service";

export type SiscomexEvent =
  | "CARGO_SHIPPED"
  | "IN_TRANSIT"
  | "CUSTOMS_ARRIVAL"
  | "CUSTOMS_RELEASED";

const DESCRIPTIONS: Record<SiscomexEvent, string> = {
  CARGO_SHIPPED:    "Embarque confirmado pelo exportador",
  IN_TRANSIT:       "Carga em trânsito internacional",
  CUSTOMS_ARRIVAL:  "Chegada ao porto de destino registrada",
  CUSTOMS_RELEASED: "Desembaraço aduaneiro concedido pela Receita Federal",
};

export const mockSiscomex = {
  async ping(): Promise<{ ok: boolean; latency_ms: number }> {
    return { ok: true, latency_ms: 142 };
  },

  emit(operationId: string, event: SiscomexEvent): OperationEvent {
    return eventEngine.buildEvent(operationId, {
      event_type: event,
      description: DESCRIPTIONS[event],
      source: "SISCOMEX",
    });
  },

  /** Simulate the entire customs cycle and return the events stream. */
  async simulateFullCycle(operationId: string): Promise<OperationEvent[]> {
    const stages: SiscomexEvent[] = [
      "CARGO_SHIPPED", "IN_TRANSIT", "CUSTOMS_ARRIVAL", "CUSTOMS_RELEASED",
    ];
    const out: OperationEvent[] = [];
    for (const s of stages) {
      await new Promise((r) => setTimeout(r, 200));
      out.push(this.emit(operationId, s));
    }
    return out;
  },
};
