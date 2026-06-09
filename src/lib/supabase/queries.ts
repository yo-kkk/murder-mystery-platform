import { supabase } from './client'
import type { Game, Venue } from '@/types'

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

export async function getGameByShortId(shortId: string): Promise<Game | null> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('short_id', shortId)
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

function toGame(data: Row): Game {
  return {
    id: data['id'] as string,
    shortId: data['short_id'] as string,
    title: data['title'] as string,
    subtitle: (data['subtitle'] as string | null) ?? undefined,
    description: data['description'] as string,
    themes: data['themes'] as Game['themes'],
    minPlayers: data['min_players'] as number,
    maxPlayers: data['max_players'] as number,
    recMinPlayers: (data['rec_min_players'] as number | null) ?? undefined,
    recMaxPlayers: (data['rec_max_players'] as number | null) ?? undefined,
    durationMinutes: data['duration_minutes'] as number,
    maxDurationMinutes: (data['max_duration_minutes'] as number | null) ?? undefined,
    requiresGm: (data['requires_gm'] as boolean) ?? false,
    avgRating: data['avg_rating'] as number,
    bayesianRating: (data['bayesian_rating'] as number) ?? 0,
    reviewCount: data['review_count'] as number,
    wishlistCount: (data['wishlist_count'] as number) ?? 0,
    publisher: (data['publisher'] as string | null) ?? undefined,
    releaseYear: (data['release_year'] as number | null) ?? undefined,
  }
}
