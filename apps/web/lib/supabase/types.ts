// Database types for Supabase
// In production, generate these with: npx supabase gen types typescript

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          github_username: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          github_username?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          github_username?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      usage: {
        Row: {
          id: string
          user_id: string
          tool: string
          metric: string
          count: number
          period_start: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tool: string
          metric: string
          count?: number
          period_start: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tool?: string
          metric?: string
          count?: number
          period_start?: string
          created_at?: string
        }
      }
      changelog_repos: {
        Row: {
          id: string
          user_id: string
          github_repo_id: number
          github_repo_name: string
          default_branch: string
          is_active: boolean
          settings: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          github_repo_id: number
          github_repo_name: string
          default_branch?: string
          is_active?: boolean
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          github_repo_id?: number
          github_repo_name?: string
          default_branch?: string
          is_active?: boolean
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      changelogs: {
        Row: {
          id: string
          repo_id: string
          version: string
          title: string
          content: string
          raw_commits: Json | null
          release_url: string | null
          is_published: boolean
          release_date: string
          created_at: string
        }
        Insert: {
          id?: string
          repo_id: string
          version: string
          title: string
          content: string
          raw_commits?: Json | null
          release_url?: string | null
          is_published?: boolean
          release_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          repo_id?: string
          version?: string
          title?: string
          content?: string
          raw_commits?: Json | null
          release_url?: string | null
          is_published?: boolean
          release_date?: string
          created_at?: string
        }
      }
      uptime_monitors: {
        Row: {
          id: string
          user_id: string
          name: string
          url: string
          method: string
          interval_seconds: number
          timeout_seconds: number
          expected_status: number
          headers: Json | null
          is_active: boolean
          current_status: string
          last_checked_at: string | null
          alert_channels: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          url: string
          method?: string
          interval_seconds?: number
          timeout_seconds?: number
          expected_status?: number
          headers?: Json | null
          is_active?: boolean
          current_status?: string
          last_checked_at?: string | null
          alert_channels?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          url?: string
          method?: string
          interval_seconds?: number
          timeout_seconds?: number
          expected_status?: number
          headers?: Json | null
          is_active?: boolean
          current_status?: string
          last_checked_at?: string | null
          alert_channels?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      uptime_checks: {
        Row: {
          id: string
          monitor_id: string
          status: string
          response_time_ms: number | null
          status_code: number | null
          error_message: string | null
          region: string
          checked_at: string
        }
        Insert: {
          id?: string
          monitor_id: string
          status: string
          response_time_ms?: number | null
          status_code?: number | null
          error_message?: string | null
          region?: string
          checked_at?: string
        }
        Update: {
          id?: string
          monitor_id?: string
          status?: string
          response_time_ms?: number | null
          status_code?: number | null
          error_message?: string | null
          region?: string
          checked_at?: string
        }
      }
      uptime_incidents: {
        Row: {
          id: string
          monitor_id: string
          status: string
          cause: string | null
          started_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          monitor_id: string
          status?: string
          cause?: string | null
          started_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          monitor_id?: string
          status?: string
          cause?: string | null
          started_at?: string
          resolved_at?: string | null
        }
      }
      commitbot_api_keys: {
        Row: {
          id: string
          user_id: string
          name: string
          key_prefix: string
          key_hash: string
          is_active: boolean
          last_used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          key_prefix: string
          key_hash: string
          is_active?: boolean
          last_used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          key_prefix?: string
          key_hash?: string
          is_active?: boolean
          last_used_at?: string | null
          created_at?: string
        }
      }
      commitbot_preferences: {
        Row: {
          id: string
          user_id: string
          style: string
          include_scope: boolean
          include_body: boolean
          max_subject_length: number
          custom_instructions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          style?: string
          include_scope?: boolean
          include_body?: boolean
          max_subject_length?: number
          custom_instructions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          style?: string
          include_scope?: boolean
          include_body?: boolean
          max_subject_length?: number
          custom_instructions?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      commitbot_commits: {
        Row: {
          id: string
          user_id: string
          repo_name: string | null
          generated_message: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          repo_name?: string | null
          generated_message: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          repo_name?: string | null
          generated_message?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
