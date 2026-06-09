import { getGames } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import { GamesClient } from './GamesClient'

export const dynamic = 'force-dynamic'

export default async function GamesPage() {
  const supabase = await createClient()

  // auth + games 병렬
  const [{ data: { user } }, games] = await Promise.all([
    supabase.auth.getUser(),
    getGames(),
  ])

  let playedIds: string[] = []
  let wishlistedIds: string[] = []
  if (user) {
    const [{ data: played }, { data: wishlisted }] = await Promise.all([
      supabase.from('play_records').select('game_id').eq('user_id', user.id),
      supabase.from('wishlists').select('game_id').eq('user_id', user.id),
    ])
    playedIds = (played ?? []).map((r: any) => r.game_id)
    wishlistedIds = (wishlisted ?? []).map((r: any) => r.game_id)
  }

  return <GamesClient games={games} playedIds={playedIds} wishlistedIds={wishlistedIds} isLoggedIn={!!user} />
}
