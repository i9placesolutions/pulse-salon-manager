export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      establishment_details: {
        Row: {
          address_city: string | null
          address_complement: string | null
          address_latitude: string | null
          address_longitude: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_zipcode: string | null
          created_at: string | null
          custom_url: string | null
          description: string | null
          document_number: string | null
          document_type: string | null
          email: string | null
          facebook: string | null
          id: string
          instagram: string | null
          logo_url: string | null
          primary_color: string | null
          responsible_email: string | null
          responsible_name: string | null
          responsible_phone: string | null
          tiktok: string | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          address_city?: string | null
          address_complement?: string | null
          address_latitude?: string | null
          address_longitude?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zipcode?: string | null
          created_at?: string | null
          custom_url?: string | null
          description?: string | null
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          facebook?: string | null
          id: string
          instagram?: string | null
          logo_url?: string | null
          primary_color?: string | null
          responsible_email?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          tiktok?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          address_city?: string | null
          address_complement?: string | null
          address_latitude?: string | null
          address_longitude?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zipcode?: string | null
          created_at?: string | null
          custom_url?: string | null
          description?: string | null
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          primary_color?: string | null
          responsible_email?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          tiktok?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          establishment_name: string
          id: string
          is_profile_complete: boolean
          subscription_active: boolean
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          establishment_name: string
          id: string
          is_profile_complete?: boolean
          subscription_active?: boolean
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          establishment_name?: string
          id?: string
          is_profile_complete?: boolean
          subscription_active?: boolean
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      system_users: {
        Row: {
          address: string | null
          auth_id: string | null
          avatar_url: string | null
          birth_date: string | null
          created_at: string | null
          email: string
          id: string
          is_professional: boolean
          last_login: string | null
          name: string
          phone: string | null
          role: string
          status: string
        }
        Insert: {
          address?: string | null
          auth_id?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_professional?: boolean
          last_login?: string | null
          name: string
          phone?: string | null
          role: string
          status?: string
        }
        Update: {
          address?: string | null
          auth_id?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_professional?: boolean
          last_login?: string | null
          name?: string
          phone?: string | null
          role?: string
          status?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          edit_appointments: boolean
          edit_clients: boolean
          edit_financial: boolean
          edit_marketing: boolean
          edit_professionals: boolean
          edit_services: boolean
          edit_stock: boolean
          id: string
          user_id: string | null
          view_appointments: boolean
          view_clients: boolean
          view_dashboard: boolean
          view_financial: boolean
          view_marketing: boolean
          view_messaging: boolean
          view_pdv: boolean
          view_professionals: boolean
          view_reports: boolean
          view_services: boolean
          view_settings: boolean
          view_stock: boolean
        }
        Insert: {
          edit_appointments?: boolean
          edit_clients?: boolean
          edit_financial?: boolean
          edit_marketing?: boolean
          edit_professionals?: boolean
          edit_services?: boolean
          edit_stock?: boolean
          id?: string
          user_id?: string | null
          view_appointments?: boolean
          view_clients?: boolean
          view_dashboard?: boolean
          view_financial?: boolean
          view_marketing?: boolean
          view_messaging?: boolean
          view_pdv?: boolean
          view_professionals?: boolean
          view_reports?: boolean
          view_services?: boolean
          view_settings?: boolean
          view_stock?: boolean
        }
        Update: {
          edit_appointments?: boolean
          edit_clients?: boolean
          edit_financial?: boolean
          edit_marketing?: boolean
          edit_professionals?: boolean
          edit_services?: boolean
          edit_stock?: boolean
          id?: string
          user_id?: string | null
          view_appointments?: boolean
          view_clients?: boolean
          view_dashboard?: boolean
          view_financial?: boolean
          view_marketing?: boolean
          view_messaging?: boolean
          view_pdv?: boolean
          view_professionals?: boolean
          view_reports?: boolean
          view_services?: boolean
          view_settings?: boolean
          view_stock?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "system_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_permissions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      users_with_permissions: {
        Row: {
          address: string | null
          auth_id: string | null
          avatar_url: string | null
          birth_date: string | null
          created_at: string | null
          edit_appointments: boolean | null
          edit_clients: boolean | null
          edit_financial: boolean | null
          edit_marketing: boolean | null
          edit_professionals: boolean | null
          edit_services: boolean | null
          edit_stock: boolean | null
          email: string | null
          id: string | null
          is_professional: boolean | null
          last_login: string | null
          name: string | null
          phone: string | null
          role: string | null
          status: string | null
          view_appointments: boolean | null
          view_clients: boolean | null
          view_dashboard: boolean | null
          view_financial: boolean | null
          view_marketing: boolean | null
          view_messaging: boolean | null
          view_pdv: boolean | null
          view_professionals: boolean | null
          view_reports: boolean | null
          view_services: boolean | null
          view_settings: boolean | null
          view_stock: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_current_user_permissions: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
