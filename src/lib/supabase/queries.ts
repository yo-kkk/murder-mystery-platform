import { supabase } from './client'
import type { Game, Venue, PlayRecord, Review } from '@/types'

type Row = Record<string, unknown>

export async function getGames(): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('avg_rating', { ascending: false })

  if (error) throw error
  return (data as Row[]).map(toGame)
}

export async function getGame(id: string): Promise<Game | null> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return toGame(data as Row)
}

export async function getVenues(): Promise<Venue[]> {
  const { data, error } = await supabase
    .from('venues')
    .select('*, venue_games(game_id)')
    .order('avg_rating', { ascending: false })

  if (error) throw error
  return (data as Row[]).map(v => ({
    id: v['id'] as string,
    name: v['name'] as string,
    type: v['type'] as Venue['type'],
    address: v['address'] as string,
    district: v['district'] as string,
    phone: (v['phone'] as string | null) ?? undefined,
    reservationUrl: (v['reservation_url'] as string | null) ?? undefined,
    avgRating: v['avg_rating'] as number,
    availableGames: ((v['venue_games'] as Row[]) ?? []).map(vg => vg['game_id'] as string),
  }))
}

export async function getVenuesByGame(gameId: string): Promise<Venue[]> {
  const { data, error } = await supabase
    .from('venue_games')
    .select('venues(*)')
    .eq('game_id', gameId)

  if (error) return []
  return (data as Row[])
    .map(row => row['venues'] as Row | null)
    .filter((v): v is Row => v !== null)
    .map(v => ({
      id: v['id'] as string,
      name: v['name'] as string,
      type: v['type'] as Venue['type'],
      address: v['address'] as string,
      district: v['district'] as string,
      phone: (v['phone'] as string | null) ?? undefined,
      reservationUrl: (v['reservation_url'] as string | null) ?? undefined,
      avgRating: v['avg_rating'] as number,
      availableGames: [],
    }))
}

export async function getMyPlayRecords(userId: string): Promise<PlayRecord[]> {
  const { data, error } = await supabase
    .from('play_records')
    .select('*')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })

  if (error) return []
  return (data as Row[]).map(r => ({
    id: r['id'] as string,
    gameId: r['game_id'] as string,
    venueId: (r['venue_id'] as string | null) ?? undefined,
    playedAt: r['played_at'] as string,
    companions: r['companions'] as string[],
    isPublic: r['is_public'] as boolean,
  }))
}

export async function getReviews(gameId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('game_id', gameId)
    .order('created_at', { ascending: false })

  if (error) return []
  return (data as Row[]).map(r => ({
    id: r['id'] as string,
    gameId: r['game_id'] as string,
    userId: r['user_id'] as string,
    userName: '익명',
    rating: r['rating'] as number,
    difficultyRating: r['difficulty_rating'] as number,
    atmosphereRating: r['atmosphere_rating'] as number,
    comment: r['comment'] as string,
    isSpoiler: r['is_spoiler'] as boolean,
    createdAt: r['created_at'] as string,
  }))
}

export async function getPlayedGameIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('play_records')
    .select('game_id')
    .eq('user_id', userId)

  if (error) return []
  return (data as Row[]).map(r => r['game_id'] as string)
}

function toGame(data: Row): Game {
  return {
    id: data['id'] as string,
    title: data['title'] as string,
    subtitle: (data['subtitle'] as string | null) ?? undefined,
    description: data['description'] as string,
    themes: data['themes'] as Game['themes'],
    difficulty: data['difficulty'] as Game['difficulty'],
    minPlayers: data['min_players'] as number,
    maxPlayers: data['max_players'] as number,
    durationMinutes: data['duration_minutes'] as number,
    imageUrl: data['image_url'] as string | null,
    avgRating: data['avg_rating'] as number,
    reviewCount: data['review_count'] as number,
    publisher: (data['publisher'] as string | null) ?? undefined,
    releaseYear: (data['release_year'] as number | null) ?? undefined,
  }
}
