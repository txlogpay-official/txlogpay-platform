# Refatoração Arquitetural — TXLOGPAY Frontend

Transformar o projeto de protótipo visual em plataforma operacional escalável, preservando 100% da identidade visual (dark navy, glow cyan/purple, stepper atual).

## Escopo

Foco em **arquitetura, tipagem, validação, estado e domínio financeiro**. Nenhuma mudança visual além de substituir o breakdown lateral por modelo financeiro real e badges/timeline reais.

## Nova estrutura de pastas

```text
src/
├── domain/              # Enums, constantes de domínio (status, triggers, tiers)
│   ├── operation.ts
│   ├── user.ts
│   └── escrow.ts
├── types/               # Interfaces TS (User, Operation, Event, Escrow, Beneficiary, PaymentProof)
│   └── index.ts
├── schemas/             # Zod schemas (SWIFT, IBAN, currency, incoterm, value, uploads)
│   ├── beneficiary.schema.ts
│   ├── operation.schema.ts
│   └── upload.schema.ts
├── services/            # Lógica de negócio
│   ├── operation.service.ts
│   ├── escrow.service.ts
│   ├── fee-engine.service.ts
│   └── event-engine.service.ts
├── mocks/               # Mocks de integração externa
│   ├── mock-siscomex.service.ts
│   └── mock-anchor.service.ts
├── stores/              # Zustand stores
│   ├── user.store.ts
│   └── operation.store.ts
├── hooks/               # Hooks operacionais (use-operation, use-fee-breakdown, use-currency-mask)
├── lib/
│   ├── formatters.ts    # Máscaras (currency, IBAN, SWIFT, DUIMP)
│   └── countries.ts     # Lista de países searchable
└── integrations/
    └── supabase/        # já existe — adicionar env.ts
```

A pasta `src/lib/operations/service.ts` atual será migrada para `src/services/operation.service.ts` com a nova API.

## 1. Domain models (TypeScript)

Criar interfaces fortes em `src/types/index.ts`:
- `User` + enum `UserTier` (STANDARD | ENTERPRISE | VIP | ANCHOR_PARTNER)
- `Operation` + enums `ReleaseTrigger` (CREATED → CUSTOMS_RELEASED) e `OperationStatus` (DRAFT → SETTLED, 8 estados)
- `OperationEvent` + enum `EventSource` (SISCOMEX | USER | TXLOGPAY | ANCHOR)
- `EscrowReservation` + enum `ReservationStatus` (PENDING | RESERVED | MONITORING | RELEASED) com breakdown completo (gross, fee, custody, settlement, net_exporter)
- `Beneficiary` (SWIFT/IBAN/banco/país)
- `PaymentProof` + enum `ValidationStatus`

Adicionar labels PT-BR + cores de badge num único mapa de domínio para reutilização na UI.

## 2. Zod schemas

- **SWIFT/BIC**: `^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$`
- **IBAN**: regex internacional (2 letras país + 2 dígitos + até 30 alfanuméricos), validação de comprimento por país básica
- **Currency**: `z.enum(["USD","EUR","BRL","CNY","GBP"])`
- **Incoterm**: `z.enum(INCOTERMS)`
- **Operation value**: positivo, decimal, máximo razoável
- **Upload**: tipo MIME (pdf/jpg/png) + tamanho máx (10MB)

## 3. Formatters e máscaras

`src/lib/formatters.ts`:
- `formatCurrency(value, currency)` → "USD 150,000.00"
- `maskCurrencyInput` (onChange handler)
- `maskIBAN`, `maskSWIFT`, `maskDUIMP` (uppercase + agrupamento)
- `parseCurrencyInput`

## 4. Fee Engine

`src/services/fee-engine.service.ts`:
```ts
calculateBreakdown(grossAmount, tier): {
  protectedAmount, operationalFee, custodyFee,
  settlementFee, totalFunding, netExporterAmount
}
```
Taxas por tier: STANDARD 0.80%, ENTERPRISE 0.45%, VIP 0.30%, ANCHOR_PARTNER 0.20%. Custódia fixa 0.10%, settlement 0.05%.

## 5. Services layer

- **operation.service.ts**: CRUD (create/update/list/get) persistindo via localStorage + emitindo eventos pelo event-engine
- **escrow.service.ts**: cria reserva, transiciona status (PENDING → RESERVED → MONITORING)
- **event-engine.service.ts**: registra `OperationEvent`s e calcula transição de `OperationStatus` baseado em trigger+evento (máquina de estados)
- **mock-siscomex.service.ts**: simula `embarque/transito/desembarque/liberacao` com delay e emite eventos
- **mock-anchor.service.ts**: `reserveFunding/releaseSettlement/getQuote` retornando rates mock

## 6. Global state (Zustand)

`bun add zustand`
- `user.store.ts` → user atual + tier
- `operation.store.ts` → operação ativa, eventos, funding atual; ações: `setCommercial`, `setBank`, `setGuarantee`, `submit`

## 7. UX operacional na tela `operacoes.conectar`

Sem mudar layout visual:
- Inputs ganham máscaras (valor, IBAN, SWIFT, DUIMP)
- País vira `Combobox` searchable (shadcn command)
- Validação inline por step com mensagens reais (zod resolver)
- Substituir cards de resumo lateral pelo **breakdown financeiro real** (5 linhas: Protegido / Fee / Custódia / Liquidação / TOTAL)
- Badges de status usam `OperationStatus` real com cores tematizadas
- Timeline da etapa final é alimentada pelo event-engine

## 8. Supabase

`src/integrations/supabase/env.ts` — placeholders (já temos `client.ts`); apenas exporta helper `hasSupabaseEnv()`. Sem novos calls a Supabase nesta etapa.

## 9. Upload

Componente `FileDropzone` (reutilizável) com schema Zod, preview, remoção, estado local. Hook `useFileUpload` preparado para futura troca para Supabase Storage (interface `UploadAdapter`).

## Arquivos afetados

**Criar** (~18):
- `src/types/index.ts`
- `src/domain/{operation,user,escrow}.ts`
- `src/schemas/{beneficiary,operation,upload}.schema.ts`
- `src/services/{operation,escrow,fee-engine,event-engine}.service.ts`
- `src/mocks/{mock-siscomex,mock-anchor}.service.ts`
- `src/stores/{user,operation}.store.ts`
- `src/hooks/{use-fee-breakdown,use-currency-mask}.ts`
- `src/lib/{formatters,countries}.ts`
- `src/components/FileDropzone.tsx`
- `src/integrations/supabase/env.ts`

**Editar**:
- `src/routes/operacoes.conectar.tsx` (refator para usar stores/services/schemas + breakdown novo)
- `src/routes/operacoes.$id.tsx` (consumir novo modelo)
- `src/routes/operacoes.index.tsx` (badges/status reais)
- `src/lib/operations/service.ts` (deprecar — re-exportar do novo service para compat)

**Dependência nova**: `zustand`

## Fora de escopo

- Conexão real com Supabase, Siscomex, Stellar
- Mudanças na identidade visual ou no stepper
- Autenticação (já implementada)
