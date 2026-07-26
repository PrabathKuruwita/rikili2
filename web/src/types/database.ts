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
      bookings: {
        Row: {
          bay_number: number | null
          created_at: string
          garage_id: string
          id: string
          notes: string | null
          owner_id: string
          service_type_id: string | null
          slot_end: string
          slot_start: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          bay_number?: number | null
          created_at?: string
          garage_id: string
          id?: string
          notes?: string | null
          owner_id: string
          service_type_id?: string | null
          slot_end: string
          slot_start: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          bay_number?: number | null
          created_at?: string
          garage_id?: string
          id?: string
          notes?: string | null
          owner_id?: string
          service_type_id?: string | null
          slot_end?: string
          slot_start?: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      garage_hours: {
        Row: {
          closes_at: string
          created_at: string
          garage_id: string
          id: string
          opens_at: string
          weekday: number
        }
        Insert: {
          closes_at: string
          created_at?: string
          garage_id: string
          id?: string
          opens_at: string
          weekday: number
        }
        Update: {
          closes_at?: string
          created_at?: string
          garage_id?: string
          id?: string
          opens_at?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "garage_hours_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
        ]
      }
      garage_services: {
        Row: {
          created_at: string
          duration_minutes: number | null
          garage_id: string
          id: string
          is_active: boolean
          price: number | null
          service_type_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          garage_id: string
          id?: string
          is_active?: boolean
          price?: number | null
          service_type_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          garage_id?: string
          id?: string
          is_active?: boolean
          price?: number | null
          service_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "garage_services_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garage_services_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      garages: {
        Row: {
          address: string | null
          bay_count: number
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          owner_id: string
          phone: string | null
          place_id: string | null
          rating: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          bay_count?: number
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          owner_id: string
          phone?: string | null
          place_id?: string | null
          rating?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          bay_count?: number
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          owner_id?: string
          phone?: string | null
          place_id?: string | null
          rating?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "garages_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          profile_id: string
          read: boolean
          ref_id: string | null
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          profile_id: string
          read?: boolean
          ref_id?: string | null
          title: string
          type: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          profile_id?: string
          read?: boolean
          ref_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          due_date: string | null
          due_mileage: number | null
          id: string
          notified_at: string | null
          owner_id: string
          status: Database["public"]["Enums"]["reminder_status"]
          trigger_type: Database["public"]["Enums"]["reminder_trigger"]
          type: Database["public"]["Enums"]["reminder_type"]
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          due_mileage?: number | null
          id?: string
          notified_at?: string | null
          owner_id: string
          status?: Database["public"]["Enums"]["reminder_status"]
          trigger_type: Database["public"]["Enums"]["reminder_trigger"]
          type: Database["public"]["Enums"]["reminder_type"]
          vehicle_id: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          due_mileage?: number | null
          id?: string
          notified_at?: string | null
          owner_id?: string
          status?: Database["public"]["Enums"]["reminder_status"]
          trigger_type?: Database["public"]["Enums"]["reminder_trigger"]
          type?: Database["public"]["Enums"]["reminder_type"]
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_parts: {
        Row: {
          id: string
          line_total: number | null
          name: string
          quantity: number
          service_record_id: string
          unit_cost: number
        }
        Insert: {
          id?: string
          line_total?: number | null
          name: string
          quantity?: number
          service_record_id: string
          unit_cost?: number
        }
        Update: {
          id?: string
          line_total?: number | null
          name?: string
          quantity?: number
          service_record_id?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_parts_service_record_id_fkey"
            columns: ["service_record_id"]
            isOneToOne: false
            referencedRelation: "service_records"
            referencedColumns: ["id"]
          },
        ]
      }
      service_records: {
        Row: {
          booking_id: string | null
          created_at: string
          created_by: string | null
          external_garage_name: string | null
          garage_id: string | null
          id: string
          invoice_url: string | null
          labour_cost: number
          odometer: number | null
          parts_cost: number
          service_date: string
          source: Database["public"]["Enums"]["record_source"]
          technician_name: string | null
          total_cost: number | null
          vehicle_id: string
          work_performed: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          external_garage_name?: string | null
          garage_id?: string | null
          id?: string
          invoice_url?: string | null
          labour_cost?: number
          odometer?: number | null
          parts_cost?: number
          service_date?: string
          source?: Database["public"]["Enums"]["record_source"]
          technician_name?: string | null
          total_cost?: number | null
          vehicle_id: string
          work_performed?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          external_garage_name?: string | null
          garage_id?: string | null
          id?: string
          invoice_url?: string | null
          labour_cost?: number
          odometer?: number | null
          parts_cost?: number
          service_date?: string
          source?: Database["public"]["Enums"]["record_source"]
          technician_name?: string | null
          total_cost?: number | null
          vehicle_id?: string
          work_performed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_records_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_records_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          brand: string | null
          created_at: string
          id: string
          mileage: number
          model: string | null
          owner_id: string
          registration_number: string
          updated_at: string
          year: number | null
        }
        Insert: {
          brand?: string | null
          created_at?: string
          id?: string
          mileage?: number
          model?: string | null
          owner_id: string
          registration_number: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          brand?: string | null
          created_at?: string
          id?: string
          mileage?: number
          model?: string | null
          owner_id?: string
          registration_number?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      booking_holds_bay: {
        Args: { s: Database["public"]["Enums"]["booking_status"] }
        Returns: boolean
      }
      garage_availability: {
        Args: {
          day: string
          duration_minutes: number
          target_garage_id: string
        }
        Returns: string[]
      }
      owns_garage: { Args: { target_garage_id: string }; Returns: boolean }
      owns_vehicle: { Args: { target_vehicle_id: string }; Returns: boolean }
      serves_profile: { Args: { target_profile_id: string }; Returns: boolean }
      services_vehicle: {
        Args: { target_vehicle_id: string }
        Returns: boolean
      }
      set_user_role: {
        Args: {
          new_role: Database["public"]["Enums"]["user_role"]
          target_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      booking_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      record_source: "booking" | "manual"
      reminder_status: "scheduled" | "due" | "completed" | "dismissed"
      reminder_trigger: "date" | "mileage"
      reminder_type:
        | "service"
        | "oil_change"
        | "insurance_renewal"
        | "emission_test"
        | "other"
      user_role: "vehicle_owner" | "garage_owner"
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
      booking_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      record_source: ["booking", "manual"],
      reminder_status: ["scheduled", "due", "completed", "dismissed"],
      reminder_trigger: ["date", "mileage"],
      reminder_type: [
        "service",
        "oil_change",
        "insurance_renewal",
        "emission_test",
        "other",
      ],
      user_role: ["vehicle_owner", "garage_owner"],
    },
  },
} as const

