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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          applied_at: string
          created_at: string
          id: string
          message: string | null
          mission_id: string
          organizer_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          volunteer_id: string
        }
        Insert: {
          applied_at?: string
          created_at?: string
          id?: string
          message?: string | null
          mission_id: string
          organizer_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          volunteer_id: string
        }
        Update: {
          applied_at?: string
          created_at?: string
          id?: string
          message?: string | null
          mission_id?: string
          organizer_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          event_type: string
          id: string
          metadata: Json
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          event_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          event_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_categories: {
        Row: {
          accent_color: string | null
          created_at: string
          description: string | null
          icon_key: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          accent_color?: string | null
          created_at?: string
          description?: string | null
          icon_key?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          accent_color?: string | null
          created_at?: string
          description?: string | null
          icon_key?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      mission_private_details: {
        Row: {
          created_at: string
          exact_address: string | null
          mission_id: string
          private_contact_email: string | null
          private_contact_name: string | null
          private_contact_phone: string | null
          private_meeting_instructions: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          exact_address?: string | null
          mission_id: string
          private_contact_email?: string | null
          private_contact_name?: string | null
          private_contact_phone?: string | null
          private_meeting_instructions?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          exact_address?: string | null
          mission_id?: string
          private_contact_email?: string | null
          private_contact_name?: string | null
          private_contact_phone?: string | null
          private_meeting_instructions?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_private_details_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: true
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          application_mode: string
          category_id: string | null
          city: string | null
          country_code: string | null
          cover_image_path: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          ends_at: string | null
          estimated_hours: number | null
          id: string
          is_beginner_friendly: boolean
          is_virtual: boolean
          latitude: number | null
          location_label: string | null
          longitude: number | null
          materials_needed: string[]
          minimum_age: number | null
          organization_id: string
          perks: string[]
          published_at: string | null
          safety_notes: string | null
          search_vector: unknown
          skills: string[]
          slug: string
          starts_at: string
          status: Database["public"]["Enums"]["mission_status"]
          summary: string
          timezone: string
          title: string
          updated_at: string
          volunteer_capacity: number | null
        }
        Insert: {
          application_mode?: string
          category_id?: string | null
          city?: string | null
          country_code?: string | null
          cover_image_path?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          ends_at?: string | null
          estimated_hours?: number | null
          id?: string
          is_beginner_friendly?: boolean
          is_virtual?: boolean
          latitude?: number | null
          location_label?: string | null
          longitude?: number | null
          materials_needed?: string[]
          minimum_age?: number | null
          organization_id: string
          perks?: string[]
          published_at?: string | null
          safety_notes?: string | null
          search_vector?: unknown
          skills?: string[]
          slug: string
          starts_at: string
          status?: Database["public"]["Enums"]["mission_status"]
          summary: string
          timezone?: string
          title: string
          updated_at?: string
          volunteer_capacity?: number | null
        }
        Update: {
          application_mode?: string
          category_id?: string | null
          city?: string | null
          country_code?: string | null
          cover_image_path?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          ends_at?: string | null
          estimated_hours?: number | null
          id?: string
          is_beginner_friendly?: boolean
          is_virtual?: boolean
          latitude?: number | null
          location_label?: string | null
          longitude?: number | null
          materials_needed?: string[]
          minimum_age?: number | null
          organization_id?: string
          perks?: string[]
          published_at?: string | null
          safety_notes?: string | null
          search_vector?: unknown
          skills?: string[]
          slug?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["mission_status"]
          summary?: string
          timezone?: string
          title?: string
          updated_at?: string
          volunteer_capacity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "missions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "mission_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          member_role: string
          organization_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          member_role?: string
          organization_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          member_role?: string
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_verifications: {
        Row: {
          created_at: string
          id: string
          internal_note: string | null
          organization_id: string
          public_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["verification_status"]
          submitted_at: string
          submitted_by: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          internal_note?: string | null
          organization_id: string
          public_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          submitted_at?: string
          submitted_by?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          internal_note?: string | null
          organization_id?: string
          public_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          submitted_at?: string
          submitted_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_verifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_verifications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_verifications_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          city: string | null
          country_code: string | null
          cover_image_path: string | null
          created_at: string
          description: string | null
          id: string
          instagram_url: string | null
          is_public: boolean
          logo_path: string | null
          name: string
          organization_type: Database["public"]["Enums"]["organization_type"]
          owner_id: string
          short_description: string | null
          slug: string
          updated_at: string
          verification_note: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
          website_url: string | null
        }
        Insert: {
          city?: string | null
          country_code?: string | null
          cover_image_path?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instagram_url?: string | null
          is_public?: boolean
          logo_path?: string | null
          name: string
          organization_type: Database["public"]["Enums"]["organization_type"]
          owner_id: string
          short_description?: string | null
          slug: string
          updated_at?: string
          verification_note?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          website_url?: string | null
        }
        Update: {
          city?: string | null
          country_code?: string | null
          cover_image_path?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instagram_url?: string | null
          is_public?: boolean
          logo_path?: string | null
          name?: string
          organization_type?: Database["public"]["Enums"]["organization_type"]
          owner_id?: string
          short_description?: string | null
          slug?: string
          updated_at?: string
          verification_note?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          availability: string[]
          avatar_url: string | null
          bio: string | null
          city: string | null
          country_code: string | null
          created_at: string
          display_name: string
          education_level: string | null
          full_name: string | null
          id: string
          interests: string[]
          is_profile_public: boolean
          referral_source: string | null
          region: string | null
          skills: string[]
          transport: string | null
          updated_at: string
          volunteer_experience: string | null
        }
        Insert: {
          availability?: string[]
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          display_name?: string
          education_level?: string | null
          full_name?: string | null
          id: string
          interests?: string[]
          is_profile_public?: boolean
          referral_source?: string | null
          region?: string | null
          skills?: string[]
          transport?: string | null
          updated_at?: string
          volunteer_experience?: string | null
        }
        Update: {
          availability?: string[]
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          display_name?: string
          education_level?: string | null
          full_name?: string | null
          id?: string
          interests?: string[]
          is_profile_public?: boolean
          referral_source?: string | null
          region?: string | null
          skills?: string[]
          transport?: string | null
          updated_at?: string
          volunteer_experience?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          internal_note: string | null
          mission_id: string | null
          organization_id: string | null
          reason: string
          reported_user_id: string | null
          reporter_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          internal_note?: string | null
          mission_id?: string | null
          organization_id?: string | null
          reason: string
          reported_user_id?: string | null
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          internal_note?: string | null
          mission_id?: string | null
          organization_id?: string | null
          reason?: string
          reported_user_id?: string | null
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_missions: {
        Row: {
          created_at: string
          id: string
          mission_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mission_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_missions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
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
      ensure_user_provisioned: { Args: never; Returns: undefined }
      get_mission_spot_counts: {
        Args: { p_mission_ids: string[] }
        Returns: {
          approved_count: number
          mission_id: string
        }[]
      }
      has_role: {
        Args: { required_role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_org_manager: { Args: { org_id: string }; Returns: boolean }
      is_org_member: { Args: { org_id: string }; Returns: boolean }
      jsonb_text_array: { Args: { data: Json; key: string }; Returns: string[] }
      provision_user: {
        Args: { p_meta: Json; p_user: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "volunteer" | "organizer" | "admin"
      application_status:
        | "pending"
        | "approved"
        | "waitlisted"
        | "declined"
        | "withdrawn"
        | "cancelled"
      mission_status:
        | "draft"
        | "pending_review"
        | "published"
        | "paused"
        | "closed"
        | "cancelled"
        | "archived"
      organization_type:
        | "nonprofit"
        | "school"
        | "university"
        | "student_club"
        | "community_group"
        | "faith_group"
        | "local_business"
        | "family_individual"
        | "other"
      verification_status: "pending" | "verified" | "rejected" | "not_required"
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
      app_role: ["volunteer", "organizer", "admin"],
      application_status: [
        "pending",
        "approved",
        "waitlisted",
        "declined",
        "withdrawn",
        "cancelled",
      ],
      mission_status: [
        "draft",
        "pending_review",
        "published",
        "paused",
        "closed",
        "cancelled",
        "archived",
      ],
      organization_type: [
        "nonprofit",
        "school",
        "university",
        "student_club",
        "community_group",
        "faith_group",
        "local_business",
        "family_individual",
        "other",
      ],
      verification_status: ["pending", "verified", "rejected", "not_required"],
    },
  },
} as const
