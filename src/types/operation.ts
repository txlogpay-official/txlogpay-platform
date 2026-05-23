// Strong typing for the TXLOGPAY operation wizard.
// These types are designed to map 1:1 to future Supabase tables.

export type Incoterm =
  | "EXW" | "FCA" | "FOB" | "CFR" | "CIF"
  | "CPT" | "CIP" | "DAP" | "DPU" | "DDP";

export type Currency = "USD" | "EUR" | "BRL" | "CNY" | "GBP";

export type ReleaseStage =
  | "criada"
  | "aceita"
  | "embarque"
  | "modal"
  | "desembarque"
  | "liberacao";

export type GuaranteeMethod = "pix" | "ted" | "swift";

export type GuaranteeStatus =
  | "aguardando"      // Pagamento aguardando confirmação
  | "reservada"       // Garantia operacional reservada
  | "monitorando";    // Monitoramento iniciado

export interface CommercialData {
  incoterm: Incoterm | "";
  valor: string;            // string while typing; parsed on submit
  moeda: Currency;
  releaseStage: ReleaseStage | "";
}

export interface DocumentRef {
  name: string;
  size: number;
  type: string;
  // Future: storage path in Supabase Storage
  url?: string;
}

export interface OperationDocuments {
  invoiceNumber: string;
  blAwb: string;
  duimp: string;
  siscomex: string;
  invoiceFile?: DocumentRef;
  packingFile?: DocumentRef;
  blAwbFile?: DocumentRef;
}

export interface ExporterBank {
  exporterName: string;
  bank: string;
  swift: string;
  iban: string;
  country: string;
  city: string;
  beneficiary: string;
}

export interface Guarantee {
  method: GuaranteeMethod;
  status: GuaranteeStatus;
  receiptFile?: DocumentRef;
  pixCopyPaste?: string;
}

export interface TimelineEvent {
  id: string;
  at: string; // ISO
  label: string;
  description?: string;
}

export interface Operation {
  id: string;
  userId: string | null;
  createdAt: string;
  commercial: CommercialData;
  documents: OperationDocuments;
  bank: ExporterBank;
  guarantee: Guarantee;
  timeline: TimelineEvent[];
  status: "rascunho" | "ativa" | "aguardando_eventos";
}

export const INCOTERMS: Incoterm[] = [
  "EXW","FCA","FOB","CFR","CIF","CPT","CIP","DAP","DPU","DDP",
];

export const CURRENCIES: Currency[] = ["USD","EUR","BRL","CNY","GBP"];

export const RELEASE_STAGES: { value: ReleaseStage; label: string; desc: string }[] = [
  { value: "criada",      label: "Criada",      desc: "Operação registrada pelo importador" },
  { value: "aceita",      label: "Aceita",      desc: "Exportador confirmou os termos" },
  { value: "embarque",    label: "Embarque",    desc: "Carga embarcada na origem" },
  { value: "modal",       label: "Em trânsito", desc: "Carga em trânsito" },
  { value: "desembarque", label: "Desembarque", desc: "Chegada ao porto de destino" },
  { value: "liberacao",   label: "Liberação",   desc: "Desembaraço concluído" },
];
