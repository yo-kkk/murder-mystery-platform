export type Database = {
  public: {
    Tables: {
      games: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          description: string
          themes: string[]
          difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          min_players: number
          max_players: number
          duration_minutes: number
          image_url: string | null
          avg_rating: number
          review_count: number
          publisher: string | null
          release_year: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['games']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['games']['Insert']>
      }
      venues: {
        Row: {
          id: string
          name: string
          type: 'party_room' | 'board_game_cafe' | 'escape_room' | 'home' | 'online'
          address: string
          district: string
          phone: string | null
          reservation_url: string | null
          avg_rating: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['venues']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['venues']['Insert']>
      }
      venue_games: {
        Row: {
          venue_id: string
          game_id: string
        }
        Insert: Database['public']['Tables']['venue_games']['Row']
        Update: Partial<Database['public']['Tables']['venue_games']['Row']>
      }
      play_records: {
        Row: {
          id: string
          user_id: string
          game_id: string
          venue_id: string | null
          played_at: string
          companions: string[]
          is_public: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['play_records']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['play_records']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          game_id: string
          rating: number
          difficulty_rating: number
          atmosphere_rating: number
          comment: string
          is_spoiler: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
    }
  }
}
