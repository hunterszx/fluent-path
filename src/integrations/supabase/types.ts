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
      flashcard_decks: {
        Row: {
          cover_emoji: string | null
          created_at: string
          description: string | null
          id: string
          lesson_id: string | null
          level: Database["public"]["Enums"]["cefr_level"] | null
          owner_id: string | null
          source_type: Database["public"]["Enums"]["card_source"]
          student_id: string | null
          teacher_id: string | null
          title: string
          topic: string | null
          updated_at: string
          visibility: Database["public"]["Enums"]["card_visibility"]
        }
        Insert: {
          cover_emoji?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lesson_id?: string | null
          level?: Database["public"]["Enums"]["cefr_level"] | null
          owner_id?: string | null
          source_type?: Database["public"]["Enums"]["card_source"]
          student_id?: string | null
          teacher_id?: string | null
          title: string
          topic?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["card_visibility"]
        }
        Update: {
          cover_emoji?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lesson_id?: string | null
          level?: Database["public"]["Enums"]["cefr_level"] | null
          owner_id?: string | null
          source_type?: Database["public"]["Enums"]["card_source"]
          student_id?: string | null
          teacher_id?: string | null
          title?: string
          topic?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["card_visibility"]
        }
        Relationships: []
      }
      flashcard_reviews: {
        Row: {
          correct_count: number
          created_at: string
          ease: number
          flashcard_id: string
          id: string
          interval_days: number
          last_reviewed_at: string | null
          mastery_score: number
          next_review_at: string | null
          status: Database["public"]["Enums"]["review_status"]
          updated_at: string
          user_id: string
          wrong_count: number
        }
        Insert: {
          correct_count?: number
          created_at?: string
          ease?: number
          flashcard_id: string
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          mastery_score?: number
          next_review_at?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
          user_id: string
          wrong_count?: number
        }
        Update: {
          correct_count?: number
          created_at?: string
          ease?: number
          flashcard_id?: string
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          mastery_score?: number
          next_review_at?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
          user_id?: string
          wrong_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_reviews_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          audio_url: string | null
          back_text: string
          created_at: string
          deck_id: string
          difficulty: number
          example_sentence: string | null
          front_text: string
          id: string
          image_url: string | null
          owner_id: string | null
          source_type: Database["public"]["Enums"]["card_source"]
          tags: string[]
          translation: string | null
          updated_at: string
          visibility: Database["public"]["Enums"]["card_visibility"]
        }
        Insert: {
          audio_url?: string | null
          back_text: string
          created_at?: string
          deck_id: string
          difficulty?: number
          example_sentence?: string | null
          front_text: string
          id?: string
          image_url?: string | null
          owner_id?: string | null
          source_type?: Database["public"]["Enums"]["card_source"]
          tags?: string[]
          translation?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["card_visibility"]
        }
        Update: {
          audio_url?: string | null
          back_text?: string
          created_at?: string
          deck_id?: string
          difficulty?: number
          example_sentence?: string | null
          front_text?: string
          id?: string
          image_url?: string | null
          owner_id?: string | null
          source_type?: Database["public"]["Enums"]["card_source"]
          tags?: string[]
          translation?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["card_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "flashcard_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          english_level: Database["public"]["Enums"]["cefr_level"] | null
          id: string
          native_language: string | null
          plan: string
          teacher_status: Database["public"]["Enums"]["teacher_status"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          english_level?: Database["public"]["Enums"]["cefr_level"] | null
          id: string
          native_language?: string | null
          plan?: string
          teacher_status?: Database["public"]["Enums"]["teacher_status"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          english_level?: Database["public"]["Enums"]["cefr_level"] | null
          id?: string
          native_language?: string | null
          plan?: string
          teacher_status?: Database["public"]["Enums"]["teacher_status"]
          updated_at?: string
        }
        Relationships: []
      }
      pronunciation_attempts: {
        Row: {
          audio_url: string | null
          created_at: string
          feedback_text: string | null
          flashcard_id: string | null
          id: string
          score: number | null
          transcript: string | null
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          feedback_text?: string | null
          flashcard_id?: string | null
          id?: string
          score?: number | null
          transcript?: string | null
          user_id: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          feedback_text?: string | null
          flashcard_id?: string | null
          id?: string
          score?: number | null
          transcript?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pronunciation_attempts_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      review_sessions: {
        Row: {
          cards_correct: number
          cards_reviewed: number
          deck_id: string | null
          finished_at: string | null
          id: string
          session_type: Database["public"]["Enums"]["session_type"]
          started_at: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          cards_correct?: number
          cards_reviewed?: number
          deck_id?: string | null
          finished_at?: string | null
          id?: string
          session_type?: Database["public"]["Enums"]["session_type"]
          started_at?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          cards_correct?: number
          cards_reviewed?: number
          deck_id?: string | null
          finished_at?: string | null
          id?: string
          session_type?: Database["public"]["Enums"]["session_type"]
          started_at?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "review_sessions_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "flashcard_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      student_flashcards: {
        Row: {
          archived_at: string | null
          deck_id: string | null
          flashcard_id: string | null
          id: string
          saved_at: string
          source_type: Database["public"]["Enums"]["card_source"]
          status: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          deck_id?: string | null
          flashcard_id?: string | null
          id?: string
          saved_at?: string
          source_type?: Database["public"]["Enums"]["card_source"]
          status?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          deck_id?: string | null
          flashcard_id?: string | null
          id?: string
          saved_at?: string
          source_type?: Database["public"]["Enums"]["card_source"]
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_flashcards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "flashcard_decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_flashcards_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_teacher: { Args: { _user_id: string }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      reject_teacher: { Args: { _user_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "aluno" | "professor" | "admin"
      card_source: "platform" | "teacher" | "student"
      card_visibility: "private" | "shared" | "public"
      cefr_level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
      review_status: "new" | "learning" | "hard" | "mastered"
      session_type: "quick" | "spaced" | "deck" | "hard"
      teacher_status: "none" | "pending" | "approved" | "rejected"
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
      app_role: ["aluno", "professor", "admin"],
      card_source: ["platform", "teacher", "student"],
      card_visibility: ["private", "shared", "public"],
      cefr_level: ["A1", "A2", "B1", "B2", "C1", "C2"],
      review_status: ["new", "learning", "hard", "mastered"],
      session_type: ["quick", "spaced", "deck", "hard"],
      teacher_status: ["none", "pending", "approved", "rejected"],
    },
  },
} as const
