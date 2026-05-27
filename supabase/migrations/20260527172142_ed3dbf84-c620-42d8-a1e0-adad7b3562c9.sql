
-- 1. Prevent tier self-escalation on profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND tier = (SELECT p.tier FROM public.profiles p WHERE p.id = auth.uid())
);

-- 2. Storage DELETE policies (user-scoped folder)
CREATE POLICY "Users can delete own payment proofs"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'payment-proofs'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own payment receipts"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'payment-receipts'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
