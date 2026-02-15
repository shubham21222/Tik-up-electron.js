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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      actions: {
        Row: {
          action_config: Json | null
          action_type: string
          automation_id: string
          created_at: string
          id: string
          sort_order: number
        }
        Insert: {
          action_config?: Json | null
          action_type?: string
          automation_id: string
          created_at?: string
          id?: string
          sort_order?: number
        }
        Update: {
          action_config?: Json | null
          action_type?: string
          automation_id?: string
          created_at?: string
          id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "actions_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
        ]
      }
      agencies: {
        Row: {
          brand_config: Json
          created_at: string
          created_by: string
          custom_domain: string | null
          id: string
          is_active: boolean
          max_clients: number
          max_overlays: number
          max_ws_connections: number
          name: string
          plan: Database["public"]["Enums"]["agency_plan"]
          slug: string
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          brand_config?: Json
          created_at?: string
          created_by: string
          custom_domain?: string | null
          id?: string
          is_active?: boolean
          max_clients?: number
          max_overlays?: number
          max_ws_connections?: number
          name: string
          plan?: Database["public"]["Enums"]["agency_plan"]
          slug: string
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          brand_config?: Json
          created_at?: string
          created_by?: string
          custom_domain?: string | null
          id?: string
          is_active?: boolean
          max_clients?: number
          max_overlays?: number
          max_ws_connections?: number
          name?: string
          plan?: Database["public"]["Enums"]["agency_plan"]
          slug?: string
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      agency_members: {
        Row: {
          agency_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["agency_role"]
          user_id: string
        }
        Insert: {
          agency_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["agency_role"]
          user_id: string
        }
        Update: {
          agency_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["agency_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_members_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      automations: {
        Row: {
          cooldown: number
          created_at: string
          id: string
          is_active: boolean
          name: string
          priority: number
          screen_id: string | null
          trigger_config: Json | null
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cooldown?: number
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          priority?: number
          screen_id?: string | null
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cooldown?: number
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          priority?: number
          screen_id?: string | null
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automations_screen_id_fkey"
            columns: ["screen_id"]
            isOneToOne: false
            referencedRelation: "screens"
            referencedColumns: ["id"]
          },
        ]
      }
      banned_users: {
        Row: {
          auto_timeout: boolean
          block_alerts: boolean
          block_chat: boolean
          block_tts: boolean
          created_at: string
          id: string
          reason: string | null
          user_id: string
          username: string
        }
        Insert: {
          auto_timeout?: boolean
          block_alerts?: boolean
          block_chat?: boolean
          block_tts?: boolean
          created_at?: string
          id?: string
          reason?: string | null
          user_id: string
          username: string
        }
        Update: {
          auto_timeout?: boolean
          block_alerts?: boolean
          block_chat?: boolean
          block_tts?: boolean
          created_at?: string
          id?: string
          reason?: string | null
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      banned_words: {
        Row: {
          apply_to_chat: boolean
          apply_to_tts: boolean
          category: string
          created_at: string
          id: string
          severity: string
          user_id: string
          word: string
        }
        Insert: {
          apply_to_chat?: boolean
          apply_to_tts?: boolean
          category?: string
          created_at?: string
          id?: string
          severity?: string
          user_id: string
          word: string
        }
        Update: {
          apply_to_chat?: boolean
          apply_to_tts?: boolean
          category?: string
          created_at?: string
          id?: string
          severity?: string
          user_id?: string
          word?: string
        }
        Relationships: []
      }
      events_log: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json | null
          screen_id: string | null
          triggered_automation_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          payload?: Json | null
          screen_id?: string | null
          triggered_automation_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json | null
          screen_id?: string | null
          triggered_automation_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_log_screen_id_fkey"
            columns: ["screen_id"]
            isOneToOne: false
            referencedRelation: "screens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_log_triggered_automation_id_fkey"
            columns: ["triggered_automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          auto_reset: boolean
          created_at: string
          current_value: number
          custom_config: Json | null
          goal_type: string
          id: string
          is_active: boolean
          milestone_alerts: boolean
          on_complete_action: string | null
          public_token: string
          screen_id: string | null
          style_preset: string
          target_value: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_reset?: boolean
          created_at?: string
          current_value?: number
          custom_config?: Json | null
          goal_type?: string
          id?: string
          is_active?: boolean
          milestone_alerts?: boolean
          on_complete_action?: string | null
          public_token?: string
          screen_id?: string | null
          style_preset?: string
          target_value?: number
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_reset?: boolean
          created_at?: string
          current_value?: number
          custom_config?: Json | null
          goal_type?: string
          id?: string
          is_active?: boolean
          milestone_alerts?: boolean
          on_complete_action?: string | null
          public_token?: string
          screen_id?: string | null
          style_preset?: string
          target_value?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_screen_id_fkey"
            columns: ["screen_id"]
            isOneToOne: false
            referencedRelation: "screens"
            referencedColumns: ["id"]
          },
        ]
      }
      live_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          is_active: boolean
          room_id: string | null
          started_at: string
          total_diamonds: number
          total_gifts: number
          unique_gifters: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          is_active?: boolean
          room_id?: string | null
          started_at?: string
          total_diamonds?: number
          total_gifts?: number
          unique_gifters?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          is_active?: boolean
          room_id?: string | null
          started_at?: string
          total_diamonds?: number
          total_gifts?: number
          unique_gifters?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      moderation_config: {
        Row: {
          allow_subscriber_links: boolean
          block_banned_words: boolean
          block_links: boolean
          caps_filter: boolean
          created_at: string
          emoji_only_filter: boolean
          first_message_review: boolean
          id: string
          safe_mode: boolean
          slow_mode: boolean
          slow_mode_seconds: number
          spam_detection: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_subscriber_links?: boolean
          block_banned_words?: boolean
          block_links?: boolean
          caps_filter?: boolean
          created_at?: string
          emoji_only_filter?: boolean
          first_message_review?: boolean
          id?: string
          safe_mode?: boolean
          slow_mode?: boolean
          slow_mode_seconds?: number
          spam_detection?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_subscriber_links?: boolean
          block_banned_words?: boolean
          block_links?: boolean
          caps_filter?: boolean
          created_at?: string
          emoji_only_filter?: boolean
          first_message_review?: boolean
          id?: string
          safe_mode?: boolean
          slow_mode?: boolean
          slow_mode_seconds?: number
          spam_detection?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      moderation_log: {
        Row: {
          action_taken: string
          created_at: string
          filter_type: string
          id: string
          original_message: string
          triggered_word: string | null
          user_id: string
          username: string
        }
        Insert: {
          action_taken?: string
          created_at?: string
          filter_type?: string
          id?: string
          original_message: string
          triggered_word?: string | null
          user_id: string
          username?: string
        }
        Update: {
          action_taken?: string
          created_at?: string
          filter_type?: string
          id?: string
          original_message?: string
          triggered_word?: string | null
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      overlay_widgets: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          public_token: string
          settings: Json
          updated_at: string
          user_id: string
          widget_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          public_token?: string
          settings?: Json
          updated_at?: string
          user_id: string
          widget_type?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          public_token?: string
          settings?: Json
          updated_at?: string
          user_id?: string
          widget_type?: string
        }
        Relationships: []
      }
      points_config: {
        Row: {
          created_at: string
          currency_name: string
          id: string
          level_base_points: number
          level_multiplier: number
          points_per_chat_minute: number
          points_per_chat_minute_enabled: boolean
          points_per_coin: number
          points_per_coin_enabled: boolean
          points_per_follow: number
          points_per_follow_enabled: boolean
          points_per_like: number
          points_per_like_enabled: boolean
          points_per_share: number
          points_per_share_enabled: boolean
          subscriber_bonus_ratio: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency_name?: string
          id?: string
          level_base_points?: number
          level_multiplier?: number
          points_per_chat_minute?: number
          points_per_chat_minute_enabled?: boolean
          points_per_coin?: number
          points_per_coin_enabled?: boolean
          points_per_follow?: number
          points_per_follow_enabled?: boolean
          points_per_like?: number
          points_per_like_enabled?: boolean
          points_per_share?: number
          points_per_share_enabled?: boolean
          subscriber_bonus_ratio?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency_name?: string
          id?: string
          level_base_points?: number
          level_multiplier?: number
          points_per_chat_minute?: number
          points_per_chat_minute_enabled?: boolean
          points_per_coin?: number
          points_per_coin_enabled?: boolean
          points_per_follow?: number
          points_per_follow_enabled?: boolean
          points_per_like?: number
          points_per_like_enabled?: boolean
          points_per_share?: number
          points_per_share_enabled?: boolean
          subscriber_bonus_ratio?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      points_history: {
        Row: {
          created_at: string
          creator_id: string
          event_detail: Json | null
          event_type: string
          id: string
          points_after: number
          points_delta: number
          viewer_username: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          event_detail?: Json | null
          event_type: string
          id?: string
          points_after?: number
          points_delta?: number
          viewer_username: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          event_detail?: Json | null
          event_type?: string
          id?: string
          points_after?: number
          points_delta?: number
          viewer_username?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          plan_type: string
          tiktok_connected: boolean
          tiktok_connected_at: string | null
          tiktok_username: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          plan_type?: string
          tiktok_connected?: boolean
          tiktok_connected_at?: string | null
          tiktok_username?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          plan_type?: string
          tiktok_connected?: boolean
          tiktok_connected_at?: string | null
          tiktok_username?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      screens: {
        Row: {
          created_at: string
          id: string
          name: string
          overlay_config: Json | null
          public_token: string
          queue_limit: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          overlay_config?: Json | null
          public_token?: string
          queue_limit?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          overlay_config?: Json | null
          public_token?: string
          queue_limit?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      session_gifts: {
        Row: {
          created_at: string
          diamond_value: number
          gift_id: string | null
          gift_name: string
          id: string
          repeat_count: number
          sender_avatar_url: string | null
          sender_username: string
          session_id: string
          total_diamonds: number
          user_id: string
        }
        Insert: {
          created_at?: string
          diamond_value?: number
          gift_id?: string | null
          gift_name: string
          id?: string
          repeat_count?: number
          sender_avatar_url?: string | null
          sender_username: string
          session_id: string
          total_diamonds?: number
          user_id: string
        }
        Update: {
          created_at?: string
          diamond_value?: number
          gift_id?: string | null
          gift_name?: string
          id?: string
          repeat_count?: number
          sender_avatar_url?: string | null
          sender_username?: string
          session_id?: string
          total_diamonds?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_gifts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_user_totals: {
        Row: {
          created_at: string
          id: string
          last_gift_at: string
          sender_avatar_url: string | null
          sender_username: string
          session_id: string
          total_diamonds: number
          total_gifts: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_gift_at?: string
          sender_avatar_url?: string | null
          sender_username: string
          session_id: string
          total_diamonds?: number
          total_gifts?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_gift_at?: string
          sender_avatar_url?: string | null
          sender_username?: string
          session_id?: string
          total_diamonds?: number
          total_gifts?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_user_totals_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tiktok_gifts: {
        Row: {
          category: string | null
          coin_value: number
          created_at: string
          gift_id: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          coin_value?: number
          created_at?: string
          gift_id: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          coin_value?: number
          created_at?: string
          gift_id?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      tts_queue: {
        Row: {
          audio_url: string | null
          created_at: string
          id: string
          overlay_token: string
          processed_at: string | null
          status: string
          text_content: string
          user_id: string
          username: string
          voice_id: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          id?: string
          overlay_token: string
          processed_at?: string | null
          status?: string
          text_content: string
          user_id: string
          username?: string
          voice_id?: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          id?: string
          overlay_token?: string
          processed_at?: string | null
          status?: string
          text_content?: string
          user_id?: string
          username?: string
          voice_id?: string
        }
        Relationships: []
      }
      tts_settings: {
        Row: {
          allowed_users: Json
          blacklist_words: Json
          charge_points: boolean
          comment_command: string
          comment_type: string
          cooldown_seconds: number
          cost_per_message: number
          created_at: string
          enabled: boolean
          filter_commands: boolean
          filter_letter_spam: boolean
          filter_mentions: boolean
          id: string
          interrupt_mode: boolean
          language: string
          max_length: number
          max_queue_length: number
          message_template: string
          min_chars: number
          pitch: number
          random_voice: boolean
          special_users: Json
          speed: number
          trigger_mode: string
          updated_at: string
          user_id: string
          voice_id: string
          voice_provider: string
          volume: number
        }
        Insert: {
          allowed_users?: Json
          blacklist_words?: Json
          charge_points?: boolean
          comment_command?: string
          comment_type?: string
          cooldown_seconds?: number
          cost_per_message?: number
          created_at?: string
          enabled?: boolean
          filter_commands?: boolean
          filter_letter_spam?: boolean
          filter_mentions?: boolean
          id?: string
          interrupt_mode?: boolean
          language?: string
          max_length?: number
          max_queue_length?: number
          message_template?: string
          min_chars?: number
          pitch?: number
          random_voice?: boolean
          special_users?: Json
          speed?: number
          trigger_mode?: string
          updated_at?: string
          user_id: string
          voice_id?: string
          voice_provider?: string
          volume?: number
        }
        Update: {
          allowed_users?: Json
          blacklist_words?: Json
          charge_points?: boolean
          comment_command?: string
          comment_type?: string
          cooldown_seconds?: number
          cost_per_message?: number
          created_at?: string
          enabled?: boolean
          filter_commands?: boolean
          filter_letter_spam?: boolean
          filter_mentions?: boolean
          id?: string
          interrupt_mode?: boolean
          language?: string
          max_length?: number
          max_queue_length?: number
          message_template?: string
          min_chars?: number
          pitch?: number
          random_voice?: boolean
          special_users?: Json
          speed?: number
          trigger_mode?: string
          updated_at?: string
          user_id?: string
          voice_id?: string
          voice_provider?: string
          volume?: number
        }
        Relationships: []
      }
      user_gift_triggers: {
        Row: {
          alert_sound_url: string | null
          animation_effect: string
          combo_threshold: number | null
          created_at: string
          custom_config: Json | null
          gift_id: string
          id: string
          is_enabled: boolean
          min_value_threshold: number | null
          priority: number
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_sound_url?: string | null
          animation_effect?: string
          combo_threshold?: number | null
          created_at?: string
          custom_config?: Json | null
          gift_id: string
          id?: string
          is_enabled?: boolean
          min_value_threshold?: number | null
          priority?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_sound_url?: string | null
          animation_effect?: string
          combo_threshold?: number | null
          created_at?: string
          custom_config?: Json | null
          gift_id?: string
          id?: string
          is_enabled?: boolean
          min_value_threshold?: number | null
          priority?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_gift_triggers_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "tiktok_gifts"
            referencedColumns: ["gift_id"]
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
      viewer_points: {
        Row: {
          created_at: string
          creator_id: string
          first_activity: string
          id: string
          last_activity: string
          level: number
          points_toward_level: number
          total_coins_sent: number
          total_gifts_sent: number
          total_likes: number
          total_messages: number
          total_points: number
          updated_at: string
          viewer_avatar_url: string | null
          viewer_username: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          first_activity?: string
          id?: string
          last_activity?: string
          level?: number
          points_toward_level?: number
          total_coins_sent?: number
          total_gifts_sent?: number
          total_likes?: number
          total_messages?: number
          total_points?: number
          updated_at?: string
          viewer_avatar_url?: string | null
          viewer_username: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          first_activity?: string
          id?: string
          last_activity?: string
          level?: number
          points_toward_level?: number
          total_coins_sent?: number
          total_gifts_sent?: number
          total_likes?: number
          total_messages?: number
          total_points?: number
          updated_at?: string
          viewer_avatar_url?: string | null
          viewer_username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_agency_role: {
        Args: {
          _agency_id: string
          _role: Database["public"]["Enums"]["agency_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_agency_member: {
        Args: { _agency_id: string; _user_id: string }
        Returns: boolean
      }
      is_owner: { Args: { _user_id: string }; Returns: boolean }
      owns_automation: { Args: { _automation_id: string }; Returns: boolean }
    }
    Enums: {
      agency_plan: "starter" | "pro" | "enterprise"
      agency_role: "owner" | "admin" | "designer"
      app_role: "admin" | "moderator" | "user"
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
      agency_plan: ["starter", "pro", "enterprise"],
      agency_role: ["owner", "admin", "designer"],
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
