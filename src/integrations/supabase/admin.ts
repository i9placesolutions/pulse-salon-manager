// This file contains a Supabase client with admin privileges (service role)
// It should ONLY be used in secure server environments, never in client-side code

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Em um ambiente Node.js, process.env seria utilizado
// No Vite, usamos import.meta.env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://bdjxwbmhfxikupidhkuf.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkanh3Ym1oZnhpa3VwaWRoa3VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mzc4NTk0NCwiZXhwIjoyMDU5MzYxOTQ0fQ.Pg_PunWxoIN-co2dnnE8S0gfdm7O_34Wj45hcb1ZSsc";

// ATENÇÃO: Este cliente possui permissões administrativas
// Nunca deve ser exposto no lado do cliente (browser)
export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
); 