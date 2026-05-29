import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Faltam variáveis de ambiente VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // PKCE é o padrão do Supabase v2 para OAuth — tornar explícito evita surpresas
    flowType: "pkce",
    // Electron não tem window.location nem storage de browser — usa localStorage
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    detectSessionInUrl: false
  }
});