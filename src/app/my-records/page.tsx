import Link from 'next/link'
import { BookOpen, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { RecordsSearch } from '@/components/molecules/RecordsSearch'
import { LoginRequiredOverlay } from '@/components/molecules/LoginRequiredOverlay'
import { AddRecordButton } from '@/components/molecules/AddRecordButton'

export const dynamic = 'force-dynamic'

export default async function MyRecordsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <LoginRequiredOverlay />

  // 기록 + wishlist 병렬
  const [{ data: records }, { count: wishlistCount }] = await Promise.all([
    supabase
      .from('play_records')
      .select(`
        id,
        played_at,
        venue_name,
        companions,
        memo,
        image_urls,
        is_best,
        game:games (
          id,
          short_id,
          title,
          avg_rating,
          min_players,
          max_players,
          duration_minutes,
          max_duration_minutes,
          requires_gm
        )
      `)
      .eq('user_id', user.id)
      .order('played_at', { ascending: false }),
    supabase.from('wishlists').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const gameIds = (records ?? []).map((r: any) => r.game?.id).filter(Boolean)
  const { data: reviews } = await (
    gameIds.length
      ? supabase.from('reviews').select('id, game_id, rating, comment, tags, is_public, is_best').eq('user_id', user.id).in('game_id', gameIds)
      : Promise.resolve({ data: [] })
  )

  const reviewMap = new Map((reviews ?? []).map((r: any) => [r.game_id, r]))
  const enriched = (records ?? []).filter((r: any) => r.game)

  const uniqueCompanions = [...new Set(enriched.flatMap((r: any) => r.companions ?? []))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BookOpen size={20} className="text-primary" />
            내 플레이 기록
          </h1>
          <p className="text-sm text-muted-foreground">총 {enriched.length}개의 게임을 플레이했어요</p>
        </div>
        <AddRecordButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '플레이한 게임', value: enriched.length },
          { label: '나의 리뷰', value: reviewMap.size },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-center">
            <div className="text-xl font-bold text-primary">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
        <Link
          href="/games?wishlist=true"
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-center flex flex-col items-center justify-center gap-1 hover:border-primary/50 transition-colors"
        >
          <div className="text-xl font-bold text-yellow-400">{wishlistCount ?? 0}</div>
          <div className="text-xs text-muted-foreground">찜 목록</div>
        </Link>
      </div>

      {/* Empty state */}
      {enriched.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center space-y-3">
          <p className="text-muted-foreground text-sm">기록된 사건이 없어요</p>
          <Link
            href="/games"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Search size={14} />
            머더 미스터리 찾아보기
          </Link>
        </div>
      ) : (
        <RecordsSearch
          records={enriched}
          reviewMap={Object.fromEntries(reviewMap)}
        />
      )}
    </div>
  )
}
