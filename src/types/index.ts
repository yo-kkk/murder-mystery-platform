export type VenueType = 'party_room' | 'board_game_cafe' | 'escape_room' | 'home' | 'online'

export interface Game {
  id: string
  shortId: string
  title: string
  subtitle?: string
  description: string
  minPlayers: number
  maxPlayers: number
  recMinPlayers?: number
  recMaxPlayers?: number
  durationMinutes: number
  maxDurationMinutes?: number
  requiresGm: boolean
  avgRating: number
  bayesianRating: number
  reviewCount: number
  wishlistCount: number
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
  atmosphereRating: number
  comment: string
  isSpoiler: boolean
  createdAt: string
}

export type GameWithReviews = Game & { reviews: Review[] }
export type PlayRecordWithGame = PlayRecord & { game: Game; venue?: Venue }
