
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dyshrzsehsxxmhzcynhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5c2hyenNlaHN4eG1oemN5bmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3MDU4NDksImV4cCI6MjA1OTI4MTg0OX0.L8wGN5Sz1nteudA9VhIRzVD3MGbA4daaxkVZnulyaZc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
