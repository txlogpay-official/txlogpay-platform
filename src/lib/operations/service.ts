// Mock service layer. Mirrors the future Supabase + Siscomex / Stellar Anchor
// integration surface. Currently persists to localStorage so the demo is real.

import type {
  Operation, CommercialData, OperationDocuments,
  ExporterBank, Guarantee, TimelineEvent, DocumentRef,
} from "@/types/operation";

const STORAGE_KEY = "txlogpay.operations.v1";

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

export function fileToRef(file: File): DocumentRef {
  return { name: file.name, size: file.size, type: file.type };
}

export interface CreateOperationInput {
  userId: string | null;
  commercial: CommercialData;
  documents: OperationDocuments;
  bank: ExporterBank;
  guarantee: Guarantee;
}

export const operationsService = {
  async create(input: CreateOperationInput): Promise<Operation> {
    // Simulated network latency for realistic UX states.
    await new Promise((r) => setTimeout(r, 600));

    const now = new Date().toISOString();
    const timeline: TimelineEvent[] = [
      { id: uid("ev"), at: now, label: "Operação registrada", description: "Dados comerciais validados" },
      { id: uid("ev"), at: now, label: "Garantia operacional reservada", description: `Método: ${input.guarantee.method.toUpperCase()}` },
      { id: uid("ev"), at: now, label: "Monitoramento iniciado", description: "Aguardando eventos aduaneiros via Siscomex API" },
    ];

    const op: Operation = {
      id: uid(),
      userId: input.userId,
      createdAt: now,
      commercial: input.commercial,
      documents: input.documents,
      bank: input.bank,
      guarantee: { ...input.guarantee, status: "monitorando" },
      timeline,
      status: "aguardando_eventos",
    };

    const all = readAll();
    all.unshift(op);
    writeAll(all);
    return op;
  },

  async list(): Promise<Operation[]> {
    return readAll();
  },

  async get(id: string): Promise<Operation | null> {
    return readAll().find((o) => o.id === id) ?? null;
  },
};

// Mock simulated PIX copy-paste payload for the guarantee step.
export function buildMockPixPayload(amount: string, opLabel: string) {
  const clean = amount.replace(/[^0-9.,]/g, "") || "0";
  return `00020126TXLOGPAY${opLabel.slice(0, 12)}520400005303986540${clean}5802BR6009SAO PAULO62070503***6304ABCD`;
}

// Reserved for future integration hooks.
export const integrations = {
  siscomex: { ping: async () => ({ ok: true, latency: 142 }) },
  stellarAnchor: { quote: async () => ({ rate: 5.42, fee: 0.008 }) },
  smartContract: { prepareSettlement: async () => ({ contractId: uid("sc") }) },
};
