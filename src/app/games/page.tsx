import { getGames } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import { GamesClient } from './GamesClient'

export const dynamic = 'force-dynamic'

export default async function GamesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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

  const games = await getGames()

  return <GamesClient games={games} playedIds={playedIds} wishlistedIds={wishlistedIds} isLoggedIn={!!user} />
}
