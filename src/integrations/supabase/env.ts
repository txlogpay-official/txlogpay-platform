// Supabase env helper. Centralises feature-flag style checks so the rest of
// the app can branch on integration availability without sniffing env vars.

export function hasSupabaseEnv(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return Boolean(url && key);
}

export const SUPABASE_PUBLIC = {
  url: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined,
  projectId: import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined,
};
