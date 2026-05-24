-- Create new bucket payment-receipts with same policies as payment-proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can view their own payment receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own payment receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment-receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own payment receipts"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'payment-receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);