import { unstable_cache } from 'next/cache'
import { supabase } from './client'
import type { Game, Venue } from '@/types'

type Row = Record<string, unknown>

// 5분 캐시 - 게임/장소 데이터는 자주 바뀌지 않음
const CACHE_TTL = 300

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

function toVenue(v: Row): Venue {
  return {
    id: v['id'] as string,
    name: v['name'] as string,
    type: v['type'] as Venue['type'],
    address: v['address'] as string,
    district: v['district'] as string,
    phone: (v['phone'] as string | null) ?? undefined,
    reservationUrl: (v['reservation_url'] as string | null) ?? undefined,
    avgRating: v['avg_rating'] as number,
    availableGames: ((v['venue_games'] as Row[]) ?? []).map(vg => vg['game_id'] as string),
  }
}

// 전체 게임 목록 (games 페이지용) - 캐시 적용
export const getGames = unstable_cache(
  async (): Promise<Game[]> => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('avg_rating', { ascending: false })
    if (error) throw error
    return (data as Row[]).map(toGame)
  },
  ['games-all'],
  { revalidate: CACHE_TTL }
)

// 홈 미리보기용 상위 N개만 fetch
export const getTopGames = unstable_cache(
  async (limit: number): Promise<Game[]> => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('avg_rating', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data as Row[]).map(toGame)
  },
  ['games-top'],
  { revalidate: CACHE_TTL }
)

// 홈 통계 (게임 수, 리뷰 수) - 캐시 적용
export const getPublicStats = unstable_cache(
  async (): Promise<{ totalGames: number; totalReviews: number }> => {
    const [gamesRes, reviewsRes] = await Promise.all([
      supabase.from('games').select('*', { count: 'exact', head: true }),
      supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('is_public', true),
    ])
    return {
      totalGames: gamesRes.count ?? 0,
      totalReviews: reviewsRes.count ?? 0,
    }
  },
  ['public-stats'],
  { revalidate: CACHE_TTL }
)

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

export const getVenues = unstable_cache(
  async (): Promise<Venue[]> => {
    const { data, error } = await supabase
      .from('venues')
      .select('*, venue_games(game_id)')
      .order('avg_rating', { ascending: false })
    if (error) throw error
    return (data as Row[]).map(toVenue)
  },
  ['venues-all'],
  { revalidate: CACHE_TTL }
)

export async function getVenuesByGame(gameId: string): Promise<Venue[]> {
  const { data, error } = await supabase
    .from('venue_games')
    .select('venues(*)')
    .eq('game_id', gameId)
  if (error) return []
  return (data as Row[])
    .map(row => row['venues'] as Row | null)
    .filter((v): v is Row => v !== null)
    .map(v => ({ ...toVenue(v), availableGames: [] }))
}
