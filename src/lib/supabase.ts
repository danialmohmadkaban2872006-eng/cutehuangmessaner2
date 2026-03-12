import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set. Using demo mode.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          internal_id: string
          display_name: string
          avatar_url: string | null
          bio: string | null
          created_at: string
          last_seen: string | null
        }
        Insert: {
          id: string
          internal_id: string
          display_name: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          last_seen?: string | null
        }
        Update: {
          display_name?: string
          avatar_url?: string | null
          bio?: string | null
          last_seen?: string | null
        }
      }
      chats: {
        Row: {
          id: string
          type: 'direct' | 'ai'
          created_at: string
          updated_at: string
        }
      }
      chat_participants: {
        Row: {
          chat_id: string
          user_id: string
          joined_at: string
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          sender_id: string | null
          content: string
          is_ai: boolean
          created_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          sender_id?: string | null
          content: string
          is_ai?: boolean
          created_at?: string
        }
      }
    }
  }
}
