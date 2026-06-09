import Link from 'next/link'
import { BookOpen, Search } from 'lucide-react'
import { HomeGamePreview } from '@/components/molecules/HomeGamePreview'
import { createClient } from '@/lib/supabase/server'
import { getTopGames, getPublicStats } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 공개 데이터(캐시) + 유저 데이터 동시 fetch
  const [previewGames, stats, userData] = await Promise.all([
    getTopGames(20),
    getPublicStats(),
    user ? Promise.all([
      supabase.from('profiles').select('nickname').eq('id', user.id).single(),
      supabase.from('play_records').select('game_id').eq('user_id', user.id),
      supabase.from('wishlists').select('game_id').eq('user_id', user.id),
    ]) : Promise.resolve(null),
  ])

  if (user && userData) {
    const [profileRes] = userData
    if (!profileRes.data?.nickname) redirect('/onboarding')
  }

  const { totalGames, totalReviews } = stats

  let playedIds: string[] = []
  let wishlistedIds: string[] = []
  let wishlistCount = 0
  if (userData) {
    const [, recordsRes, wishlistRes] = userData
    playedIds = (recordsRes.data ?? []).map((r: { game_id: string }) => r.game_id)
    wishlistedIds = (wishlistRes.data ?? []).map((r: { game_id: string }) => r.game_id)
    wishlistCount = wishlistedIds.length
  }

  const playedGames = previewGames.filter(g => playedIds.includes(g.id))
  const totalMinutes = playedGames.reduce((sum, g) => {
    const mid = g.maxDurationMinutes
      ? Math.round((g.durationMinutes + g.maxDurationMinutes) / 2)
      : g.durationMinutes
    return sum + mid
  }, 0)

  // 비로그인 상태
  if (!user) {
    const stats = [
      { label: '등록된 머미', value: totalGames, suffix: '개' },
      { label: '등록된 리뷰 수', value: totalReviews, suffix: '개' },
    ]
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center text-center space-y-6 pt-6">
          <div className="space-y-3">
            <h1
              className="text-3xl font-bold"
              style={{ color: 'var(--gold)', fontFamily: 'var(--font-serif)' }}
            >
              어제의 <span className="text-primary">머미</span>
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              플레이한 게임을 기록하고,<br />새로운 사건을 찾아보세요
            </p>
          </div>

          <div className="w-full max-w-xs grid grid-cols-2 gap-3">
            {stats.map(({ label, value, suffix }) => (
              <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-center">
                <div className="text-lg font-bold text-primary">
                  {value.toLocaleString()}{suffix}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{label}</div>
              </div>
            ))}
          </div>

          <Link
            href="/login"
            className="w-full max-w-xs block py-3.5 rounded-xl font-semibold text-sm text-center bg-[var(--gold)] text-black hover:opacity-90 transition-opacity"
          >
            로그인 후 시작하기
          </Link>
        </div>

        <HomeGamePreview games={previewGames} wishlistedIds={[]} isLoggedIn={false} />
      </div>
    )
  }

  // 로그인 + 플레이 기록 없음
  if (playedGames.length === 0) {
    return (
      <div className="space-y-8">
        <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center space-y-4">
          <BookOpen size={40} className="mx-auto text-muted-foreground/40" />
          <div className="space-y-1">
            <p className="font-medium text-foreground">첫 번째 사건을 기록해보세요</p>
            <p className="text-sm text-muted-foreground">플레이한 게임을 찾아 기록하고 평가할 수 있어요</p>
          </div>
          <div className="flex justify-center pt-2">
            <Link
              href="/games"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Search size={15} />
              머더 미스터리 찾아보기
            </Link>
          </div>
        </div>

        <HomeGamePreview
          games={previewGames.filter(g => !playedIds.includes(g.id) || wishlistedIds.includes(g.id))}
          wishlistedIds={wishlistedIds}
          isLoggedIn
        />
      </div>
    )
  }

  // 로그인 + 플레이 기록 있음
  return (
    <div className="space-y-6">
      <div className="py-4 space-y-1">
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--gold)', fontFamily: 'var(--font-serif)' }}
        >
          내 사건 파일
        </h1>
        <p className="text-muted-foreground text-sm">총 {playedGames.length}개의 머미를 졸업했어요</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: '플레이한 게임', value: playedGames.length },
          { label: '총 플레이 시간', value: totalMinutes > 0 ? `약 ${Math.round(totalMinutes / 60)}시간` : '-' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-center">
            <div className="text-xl font-bold text-primary">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Link
          href="/my-records"
          className="flex flex-col items-center gap-2 py-5 rounded-xl border border-white/10 bg-white/[0.06] hover:bg-white/[0.10] hover:border-white/20 transition-colors text-center"
        >
          <BookOpen size={22} className="text-white/70" />
          <span className="text-sm font-medium text-white/80">내 기록 보기</span>
        </Link>
        <Link
          href="/games"
          className="flex flex-col items-center gap-2 py-5 rounded-xl border border-white/10 bg-white/[0.06] hover:bg-white/[0.10] hover:border-white/20 transition-colors text-center"
        >
          <Search size={22} className="text-white/70" />
          <span className="text-sm font-medium text-white/80">머미 찾아보기</span>
        </Link>
        <Link
          href="/games?wishlist=true"
          className="flex flex-col items-center gap-2 py-5 rounded-xl border border-white/10 bg-white/[0.06] hover:bg-white/[0.10] hover:border-white/20 transition-colors text-center"
        >
          <div className="h-[22px] flex items-center text-xl font-bold text-yellow-400">{wishlistCount}</div>
          <span className="text-sm font-medium text-white/80">찜 목록</span>
        </Link>
      </div>

      <HomeGamePreview
        games={previewGames.filter(g => !playedIds.includes(g.id) || wishlistedIds.includes(g.id))}
        wishlistedIds={wishlistedIds}
        isLoggedIn
      />
    </div>
  )
}
