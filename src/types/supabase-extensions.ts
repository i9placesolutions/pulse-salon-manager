
import type { Database } from "@/integrations/supabase/types";

// Aqui definimos tipos que estendem os tipos do Supabase
// sem modificar o arquivo original

// Exemplo de como estender um tipo:
// export type ProfileWithExtras = Database['public']['Tables']['profiles']['Row'] & {
//   extraField: string;
// };

// Exportamos os tipos existentes para facilitar o uso
export type { Database } from "@/integrations/supabase/types";
