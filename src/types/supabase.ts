
import { Database } from "@/integrations/supabase/types";

// Tipagem para tabela de usuários do sistema
export type SystemUser = {
  id: string;
  auth_id?: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'professional' | 'receptionist' | 'user';
  is_professional: boolean;
  birth_date?: string;
  address?: string;
  avatar_url?: string;
  created_at?: string;
  last_login?: string;
  status: 'active' | 'inactive';
};

// Tipagem para permissões de usuário
export type UserPermission = {
  id: string;
  user_id?: string;
  view_dashboard: boolean;
  view_appointments: boolean;
  view_clients: boolean;
  view_services: boolean;
  view_professionals: boolean;
  view_pdv: boolean;
  view_financial: boolean;
  view_stock: boolean;
  view_marketing: boolean;
  view_messaging: boolean;
  view_reports: boolean;
  view_settings: boolean;
  edit_appointments: boolean;
  edit_clients: boolean;
  edit_services: boolean;
  edit_professionals: boolean;
  edit_financial: boolean;
  edit_stock: boolean;
  edit_marketing: boolean;
};

// Tipo para a visualização users_with_permissions
export type UserWithPermissions = SystemUser & UserPermission;

// Tipagem para os bloqueios de horário
export type BlockedTime = {
  id: string;
  professional_id?: string;
  establishment_id: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  reason?: string;
  is_full_day: boolean;
  created_at: string;
};

// Tipagem para eventos de webhook
export type WebhookEvent = {
  id: string;
  provider: string;
  event_type: string;
  payload: any;
  processed: boolean;
  processed_at?: string;
  processing_result?: string;
  created_at: string;
};

// Tipagem para histórico de pagamentos
export type PaymentHistory = {
  id: string;
  external_id: string;
  customer_id: string;
  amount: number;
  payment_date: string;
  due_date?: string;
  payment_method: string;
  description: string;
  status: string;
  subscription_id?: string;
  provider: string;
  invoice_url?: string;
  created_at: string;
};

// Tipagem para assinaturas
export type Subscription = {
  id: string;
  external_id: string;
  customer_id: string;
  plan_value: number;
  billing_type: string;
  status: string;
  next_billing_date: string;
  description: string;
  provider: string;
  created_at: string;
  updated_at?: string;
};

// Extensão de tipos para o cliente Supabase
export type SupabaseCustomTypes = {
  system_users: SystemUser;
  user_permissions: UserPermission;
  users_with_permissions: UserWithPermissions;
  blocked_times: BlockedTime;
  webhook_events: WebhookEvent;
  payment_history: PaymentHistory;
  subscriptions: Subscription;
};

// Tipagem para resultados de API
export type ApiResponse<T = any> = {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  id?: string;
  invoiceUrl?: string;
};

export type SubscriptionResponse = {
  id: string;
  invoiceUrl?: string;
  status: string;
};

// Extensão do tipo Json da base de dados
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];
