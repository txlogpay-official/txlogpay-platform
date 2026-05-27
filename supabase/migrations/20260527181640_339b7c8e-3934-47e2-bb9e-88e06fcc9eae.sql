
ALTER TABLE public.operations
  ADD COLUMN IF NOT EXISTS operation_wallet_secret TEXT,
  ADD COLUMN IF NOT EXISTS settlement_wallet TEXT,
  ADD COLUMN IF NOT EXISTS settlement_wallet_secret TEXT,
  ADD COLUMN IF NOT EXISTS settlement_status TEXT,
  ADD COLUMN IF NOT EXISTS settlement_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS asset_code TEXT;

CREATE TABLE IF NOT EXISTS public.platform_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  issuer_public TEXT NOT NULL,
  issuer_secret TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.platform_assets TO service_role;

ALTER TABLE public.platform_assets ENABLE ROW LEVEL SECURITY;

-- Sem políticas para authenticated/anon: tabela acessada apenas via service_role
-- (server functions com supabaseAdmin).
