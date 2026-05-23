import { z } from "zod";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png"] as const;

export const uploadSchema = z.object({
  name: z.string().min(1),
  size: z.number().max(MAX_UPLOAD_BYTES, "Arquivo acima de 10MB"),
  type: z.string().refine(
    (t) => (ALLOWED_MIME as readonly string[]).includes(t),
    "Tipo inválido. Use PDF, JPG ou PNG",
  ),
});

export type UploadedFile = z.infer<typeof uploadSchema> & {
  url?: string; // future: Supabase Storage URL
};

export function validateFile(file: File): { ok: true; data: UploadedFile } | { ok: false; error: string } {
  const parsed = uploadSchema.safeParse({ name: file.name, size: file.size, type: file.type });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Arquivo inválido" };
  }
  return { ok: true, data: parsed.data };
}
