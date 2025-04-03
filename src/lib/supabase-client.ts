
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/types/supabase-extensions";

// Exportamos o cliente Supabase com os tipos corretos
export { supabase };

// Funções auxiliares para trabalhar com o Supabase
export const getErrorMessage = (error: any): string => {
  return error?.message || "Ocorreu um erro desconhecido";
};

// Tipo genérico para respostas do Supabase
export type SupabaseResponse<T> = {
  data: T | null;
  error: Error | null;
};
