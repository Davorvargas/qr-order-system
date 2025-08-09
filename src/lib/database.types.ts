export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      menu_categories: {
        Row: {
          created_at: string
          display_order: number | null
          id: number
          is_available: boolean | null
          name: string
          restaurant_id: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: never
          is_available?: boolean | null
          name: string
          restaurant_id?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: never
          is_available?: boolean | null
          name?: string
          restaurant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category_id: number | null
          created_at: string
          description: string | null
          display_order: number | null
          id: number
          image_url: string | null
          is_available: boolean
          name: string
          price: number | null
          restaurant_id: string | null
        }
        Insert: {
          category_id?: number | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: never
          image_url?: string | null
          is_available?: boolean
          name: string
          price?: number | null
          restaurant_id?: string | null
        }
        Update: {
          category_id?: number | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: never
          image_url?: string | null
          is_available?: boolean
          name?: string
          price?: number | null
          restaurant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: number
          menu_item_id: number
          notes: string | null
          order_id: number
          price_at_order: number | null
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: never
          menu_item_id: number
          notes?: string | null
          order_id: number
          price_at_order?: number | null
          quantity?: number
        }
        Update: {
          created_at?: string
          id?: never
          menu_item_id?: number
          notes?: string | null
          order_id?: number
          price_at_order?: number | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_name: string
          drink_printed: boolean | null
          id: number
          is_new_order: boolean | null
          is_preparing: boolean | null
          is_ready: boolean | null
          kitchen_printed: boolean | null
          notes: string | null
          restaurant_id: string | null
          source: string
          status: Database["public"]["Enums"]["order_status_enum"]
          table_id: string
          total_price: number | null
        }
        Insert: {
          created_at?: string
          customer_name: string
          drink_printed?: boolean | null
          id?: never
          is_new_order?: boolean | null
          is_preparing?: boolean | null
          is_ready?: boolean | null
          kitchen_printed?: boolean | null
          notes?: string | null
          restaurant_id?: string | null
          source?: string
          status?: Database["public"]["Enums"]["order_status_enum"]
          table_id: string
          total_price?: number | null
        }
        Update: {
          created_at?: string
          customer_name?: string
          drink_printed?: boolean | null
          id?: never
          is_new_order?: boolean | null
          is_preparing?: boolean | null
          is_ready?: boolean | null
          kitchen_printed?: boolean | null
          notes?: string | null
          restaurant_id?: string | null
          source?: string
          status?: Database["public"]["Enums"]["order_status_enum"]
          table_id?: string
          total_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      printers: {
        Row: {
          created_at: string
          description: string | null
          error_message: string | null
          id: string
          is_active: boolean
          last_status_check: string | null
          location: string | null
          name: string
          product_id: number | null
          restaurant_id: string
          status: string | null
          type: string
          vendor_id: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          error_message?: string | null
          id?: string
          is_active?: boolean
          last_status_check?: string | null
          location?: string | null
          name: string
          product_id?: number | null
          restaurant_id: string
          status?: string | null
          type: string
          vendor_id?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          error_message?: string | null
          id?: string
          is_active?: boolean
          last_status_check?: string | null
          location?: string | null
          name?: string
          product_id?: number | null
          restaurant_id?: string
          status?: string | null
          type?: string
          vendor_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "printers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_registers: {
        Row: {
          id: string
          restaurant_id: string
          opened_at: string
          closed_at: string | null
          opening_amount: number
          closing_amount: number | null
          total_sales: number
          total_qr: number
          total_card: number
          total_cash: number
          difference: number | null
          status: string
          opened_by: string | null
          closed_by: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          opened_at?: string
          closed_at?: string | null
          opening_amount?: number
          closing_amount?: number | null
          total_sales?: number
          total_qr?: number
          total_card?: number
          total_cash?: number
          difference?: number | null
          status?: string
          opened_by?: string | null
          closed_by?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          opened_at?: string
          closed_at?: string | null
          opening_amount?: number
          closing_amount?: number | null
          total_sales?: number
          total_qr?: number
          total_card?: number
          total_cash?: number
          difference?: number | null
          status?: string
          opened_by?: string | null
          closed_by?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_registers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_registers_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_registers_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      order_payments: {
        Row: {
          id: string
          order_id: number
          cash_register_id: string | null
          payment_method: string
          amount: number
          processed_at: string
          processed_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: number
          cash_register_id?: string | null
          payment_method: string
          amount: number
          processed_at?: string
          processed_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: number
          cash_register_id?: string | null
          payment_method?: string
          amount?: number
          processed_at?: string
          processed_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_payments_cash_register_id_fkey"
            columns: ["cash_register_id"]
            isOneToOne: false
            referencedRelation: "cash_registers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_payments_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          role?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      tables: {
        Row: {
          created_at: string
          id: string
          restaurant_id: string
          table_number: string
        }
        Insert: {
          created_at?: string
          id?: string
          restaurant_id: string
          table_number: string
        }
        Update: {
          created_at?: string
          id?: string
          restaurant_id?: string
          table_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_new_order: {
        Args: { payload: Json }
        Returns: Json
      }
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      order_status_enum:
        | "order_placed"
        | "receipt_printed"
        | "completed"
        | "cancelled"
        | "kitchen_printed"
        | "pending"
        | "in_progress"
        | "merged"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      order_status_enum: [
        "order_placed",
        "receipt_printed",
        "completed",
        "cancelled",
        "kitchen_printed",
        "pending",
        "in_progress",
        "merged",
      ],
    },
  },
} as const
