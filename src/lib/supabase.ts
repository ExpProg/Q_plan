import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xtvtofvxkqvovcfuoudq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0dnRvZnZ4a3F2b3ZjZnVvdWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNDE0NTAsImV4cCI6MjA2NjYxNzQ1MH0.pIlaJcKv-n9fkAYDiL_ywfHO7qZ0yuWxv0p8qn2XDLk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Типы для базы данных
export type Database = {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      quarters: {
        Row: {
          id: string
          name: string
          start_date: string
          end_date: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          start_date: string
          end_date: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          start_date?: string
          end_date?: string
          created_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          name: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          created_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          name: string
          email: string
          team_id: string
          role_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          team_id: string
          role_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          team_id?: string
          role_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      plan_variants: {
        Row: {
          id: string
          name: string
          team_id: string
          quarter_id: string
          is_express: boolean
          is_main: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          team_id: string
          quarter_id: string
          is_express?: boolean
          is_main?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          team_id?: string
          quarter_id?: string
          is_express?: boolean
          is_main?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string
          team_id: string
          quarter_id: string | null
          plan_variant_id: string | null
          is_planned: boolean
          impact: number
          confidence: number
          ease: number
          express_estimate: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          team_id: string
          quarter_id?: string | null
          plan_variant_id?: string | null
          is_planned?: boolean
          impact: number
          confidence: number
          ease: number
          express_estimate?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          team_id?: string
          quarter_id?: string | null
          plan_variant_id?: string | null
          is_planned?: boolean
          impact?: number
          confidence?: number
          ease?: number
          express_estimate?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      member_capacities: {
        Row: {
          id: string
          member_id: string
          quarter_id: string
          capacity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          member_id: string
          quarter_id: string
          capacity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          quarter_id?: string
          capacity?: number
          created_at?: string
          updated_at?: string
        }
      }
      team_capacities: {
        Row: {
          id: string
          team_id: string
          quarter_id: string
          capacity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          quarter_id: string
          capacity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          quarter_id?: string
          capacity?: number
          created_at?: string
          updated_at?: string
        }
      }
      task_role_capacities: {
        Row: {
          id: string
          task_id: string
          role_id: string
          capacity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          role_id: string
          capacity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          role_id?: string
          capacity?: number
          created_at?: string
          updated_at?: string
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