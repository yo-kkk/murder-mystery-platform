export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type Theme = 'victorian' | 'modern' | 'fantasy' | 'horror' | 'comedy' | 'historical' | 'scifi'
export type VenueType = 'party_room' | 'board_game_cafe' | 'escape_room' | 'home' | 'online'

export interface Game {
  id: string
  title: string
  subtitle?: string
  description: string
  themes: Theme[]
  difficulty: Difficulty
  minPlayers: number
  maxPlayers: number
  recMinPlayers?: number
  recMaxPlayers?: number
  durationMinutes: number
  maxDurationMinutes?: number
  requiresGm: boolean
  imageUrl?: string | null
  avgRating: number
  reviewCount: number
  publisher?: string
  releaseYear?: number
}

export interface Venue {
  id: string
  name: string
  type: VenueType
  address: string
  district: string
  phone?: string
  reservationUrl?: string
  avgRating: number
  availableGames: string[]
}

export interface PlayRecord {
  id: string
  gameId: string
  venueId?: string
  playedAt: string
  companions: string[]
  isPublic: boolean
  myReviewId?: string
}

export interface Review {
  id: string
  gameId: string
  userId: string
  userName: string
  rating: number
  difficultyRating: number
  atmosphereRating: number
  comment: string
  isSpoiler: boolean
  createdAt: string
}

export type GameWithReviews = Game & { reviews: Review[] }
export type PlayRecordWithGame = PlayRecord & { game: Game; venue?: Venue }
