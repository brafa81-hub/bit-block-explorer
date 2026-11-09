export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      eventos: {
        Row: {
          cantidad: number | null
          created_at: string
          detalle: string | null
          id: string
          modo: string | null
          producto: string | null
          referrer: string | null
          tipo: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          cantidad?: number | null
          created_at?: string
          detalle?: string | null
          id?: string
          modo?: string | null
          producto?: string | null
          referrer?: string | null
          tipo: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          cantidad?: number | null
          created_at?: string
          detalle?: string | null
          id?: string
          modo?: string | null
          producto?: string | null
          referrer?: string | null
          tipo?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      game_challenges: {
        Row: {
          best_fee: number
          capacity: number
          id: number
          name: string
          time_limit: number
          transactions: Json
        }
        Insert: {
          best_fee: number
          capacity: number
          id: number
          name: string
          time_limit: number
          transactions: Json
        }
        Update: {
          best_fee?: number
          capacity?: number
          id?: number
          name?: string
          time_limit?: number
          transactions?: Json
        }
        Relationships: []
      }
      game_entries: {
        Row: {
          alias: string
          confirmation_hash: string
          confirmed_at: string | null
          consent_at: string
          email: string
          hidden: boolean
          id: string
          play_day: string
          reviewed: boolean
          run_id: string
          score: number
          total_ms: number
          week: string
        }
        Insert: {
          alias: string
          confirmation_hash: string
          confirmed_at?: string | null
          consent_at?: string
          email: string
          hidden?: boolean
          id?: string
          play_day: string
          reviewed?: boolean
          run_id: string
          score: number
          total_ms: number
          week: string
        }
        Update: {
          alias?: string
          confirmation_hash?: string
          confirmed_at?: string | null
          consent_at?: string
          email?: string
          hidden?: boolean
          id?: string
          play_day?: string
          reviewed?: boolean
          run_id?: string
          score?: number
          total_ms?: number
          week?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_entries_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: true
            referencedRelation: "game_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      game_events: {
        Row: {
          email: string | null
          extra: Json
          fecha: string
          id: string
          ref: string | null
          run_id: string | null
          tipo: string
          visitor_id: string
        }
        Insert: {
          email?: string | null
          extra?: Json
          fecha?: string
          id?: string
          ref?: string | null
          run_id?: string | null
          tipo: string
          visitor_id: string
        }
        Update: {
          email?: string | null
          extra?: Json
          fecha?: string
          id?: string
          ref?: string | null
          run_id?: string | null
          tipo?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_events_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "game_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      game_rounds: {
        Row: {
          challenge_id: number
          elapsed_ms: number | null
          run_id: string
          score: number | null
          selected: Json | null
          started_at: string
          submitted_at: string | null
        }
        Insert: {
          challenge_id: number
          elapsed_ms?: number | null
          run_id: string
          score?: number | null
          selected?: Json | null
          started_at?: string
          submitted_at?: string | null
        }
        Update: {
          challenge_id?: number
          elapsed_ms?: number | null
          run_id?: string
          score?: number | null
          selected?: Json | null
          started_at?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_rounds_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "game_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_rounds_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "game_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      game_runs: {
        Row: {
          completed_at: string | null
          id: string
          ref: string | null
          score: number | null
          secret: string
          started_at: string
          total_ms: number | null
          visitor_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          ref?: string | null
          score?: number | null
          secret?: string
          started_at?: string
          total_ms?: number | null
          visitor_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          ref?: string | null
          score?: number | null
          secret?: string
          started_at?: string
          total_ms?: number | null
          visitor_id?: string
        }
        Relationships: []
      }
      lista_espera: {
        Row: {
          cantidad: number
          created_at: string
          cuando: string | null
          email: string
          id: string
          modo: string | null
          para_quien: string | null
          producto: string | null
          referrer: string | null
          tipo: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          cantidad?: number
          created_at?: string
          cuando?: string | null
          email: string
          id?: string
          modo?: string | null
          para_quien?: string | null
          producto?: string | null
          referrer?: string | null
          tipo?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          cantidad?: number
          created_at?: string
          cuando?: string | null
          email?: string
          id?: string
          modo?: string | null
          para_quien?: string | null
          producto?: string | null
          referrer?: string | null
          tipo?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      solicitudes_potencia: {
        Row: {
          created_at: string
          email: string
          fecha: string
          id: string
          potencia_ph: number
          referrer: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          created_at?: string
          email: string
          fecha: string
          id?: string
          potencia_ph: number
          referrer?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          fecha?: string
          id?: string
          potencia_ph?: number
          referrer?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      game_ranking: {
        Row: {
          alias: string | null
          score: number | null
          total_ms: number | null
          week: string | null
        }
        Insert: {
          alias?: string | null
          score?: number | null
          total_ms?: number | null
          week?: string | null
        }
        Update: {
          alias?: string | null
          score?: number | null
          total_ms?: number | null
          week?: string | null
        }
        Relationships: []
      }
      resumen_diario: {
        Row: {
          clics_comprar: number | null
          dia: string | null
          emails: number | null
          visitas: number | null
        }
        Relationships: []
      }
      resumen_origen: {
        Row: {
          campana: string | null
          clics_comprar: number | null
          emails: number | null
          origen: string | null
          pct_visita_a_email: number | null
          visitas: number | null
        }
        Relationships: []
      }
      resumen_productos: {
        Row: {
          clics_comprar: number | null
          emails: number | null
          modo: string | null
          pct_clic_a_email: number | null
          producto: string | null
        }
        Relationships: []
      }
      resumen_respuestas: {
        Row: {
          cuando: string | null
          emails: number | null
          para_quien: string | null
          producto: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      game_enroll: {
        Args: {
          _alias: string
          _email: string
          _hash: string
          _run: string
          _secret: string
        }
        Returns: string
      }
      game_start: {
        Args: {
          _ref: string
          _run?: string
          _secret?: string
          _visitor: string
        }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      submit_game: {
        Args: {
          _challenge: number
          _run: string
          _secret: string
          _selected: string[]
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
