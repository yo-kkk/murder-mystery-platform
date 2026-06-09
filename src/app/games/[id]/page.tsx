import { notFound } from 'next/navigation'
import { ArrowLeft, Users, Clock, MapPin, Building2 } from 'lucide-react'
import { ReviewsSection } from '@/components/molecules/ReviewsSection'
import Link from 'next/link'
import { StarRating } from '@/components/atoms/StarRating'
import { VENUE_TYPE_LABEL, formatDurationRange } from '@/lib/utils'
import { getGameByShortId, getGames, getVenuesByGame } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import { RecordButton } from '@/components/molecules/RecordButton'
import { WishlistButton } from '@/components/molecules/WishlistButton'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const games = await getGames()
  return games.map(g => ({ id: g.shortId }))
}

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()

  // Batch 1: auth + game + venues 병렬
  const [{ data: { user } }, game, venues] = await Promise.all([
    supabase.auth.getUser(),
    getGameByShortId(id),
    getVenuesByGame(id),
  ])

  if (!game) notFound()

  // Batch 2: 공개 리뷰 + 유저 데이터 병렬
  const [
    publicReviewsData,
    userData,
  ] = await Promise.all([
    supabase
      .from('reviews')
      .select('id, rating, comment, tags, is_best, created_at, user_id')
      .eq('game_id', game.id)
      .eq('is_public', true)
      .order('created_at', { ascending: false }),
    user ? Promise.all([
      supabase.from('play_records').select('id, played_at, venue_name, companions, memo, image_urls, is_best').eq('user_id', user.id).eq('game_id', game.id).maybeSingle(),
      supabase.from('reviews').select('id, rating, comment, tags, is_public, is_best, created_at').eq('user_id', user.id).eq('game_id', game.id).maybeSingle(),
      supabase.from('wishlists').select('id').eq('user_id', user.id).eq('game_id', game.id).maybeSingle(),
      supabase.from('profiles').select('nickname, is_nickname_public').eq('id', user.id).single(),
    ]) : Promise.resolve(null),
  ])

  const rawReviews = publicReviewsData.data ?? []

  let reviews: { id: string; rating: number; comment: string | null; tags: string[]; is_best: boolean; created_at: string; nickname: string }[] = []

  if (rawReviews.length > 0) {
    const userIds = [...new Set(rawReviews.map(r => r.user_id))]
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, nickname, is_nickname_public')
      .in('id', userIds)

    const profileMap = Object.fromEntries((profilesData ?? []).map(p => [p.id, p]))

    reviews = rawReviews.map(r => {
      const p = profileMap[r.user_id]
      const nickname = p?.is_nickname_public && p?.nickname ? p.nickname : '(비공개 유저)'
      return { ...r, nickname }
    })
  }

  let existingRecord = null
  let existingReview = null
  let isWishlisted = false

  if (user && userData) {
    const [{ data: record }, { data: review }, { data: wishlist }, { data: profile }] = userData
    existingRecord = record
    isWishlisted = !!wishlist

    if (review) {
      const nickname = profile?.is_nickname_public && profile?.nickname ? profile.nickname : '(비공개 유저)'
      existingReview = { ...review, nickname }
    }
  }


  return (
    <div className="space-y-6">
      <Link href="/games" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors w-fit">
        <ArrowLeft size={15} /> 목록으로
      </Link>

      {/* Hero */}
      <div className="relative rounded-xl overflow-hidden border border-[var(--border)]">
        <div className="h-48 bg-gradient-to-br from-[var(--card)] via-primary/10 to-black flex items-end p-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-serif)' }}>
              {game.title}
            </h1>
            {game.subtitle && <p className="text-sm text-muted-foreground">{game.subtitle}</p>}
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 space-y-1">
          {game.reviewCount >= 3 ? (
            <>
              <StarRating rating={game.bayesianRating} size="md" />
              <p className="text-xs text-muted-foreground">{game.reviewCount}개의 리뷰</p>
            </>
          ) : game.reviewCount > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">평가 집계 중</p>
              <p className="text-xs text-muted-foreground">{game.reviewCount}개의 리뷰</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">평가 없음</p>
          )}
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users size={14} />
            {game.minPlayers === game.maxPlayers
              ? `${game.minPlayers}인`
              : `${game.minPlayers}~${game.maxPlayers}인`}
            {game.requiresGm && (
              <span className="text-xs px-1.5 py-0.5 rounded border border-yellow-500/50 text-yellow-500 leading-none">GM필수</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock size={14} />
            {formatDurationRange(game.durationMinutes, game.maxDurationMinutes)}
          </div>
        </div>
      </div>

      {/* Description */}
      {game.description && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-semibold text-[var(--gold)] mb-2 uppercase tracking-wider">시놉시스</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{game.description}</p>
        </div>
      )}

      {/* Publisher info */}
      {(game.publisher || game.releaseYear) && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-semibold text-[var(--gold)] mb-3 uppercase tracking-wider">제작사 정보</h2>
          <div className="flex flex-col gap-2">
            {game.publisher && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 size={14} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">제작사</span>
                <span className="text-foreground font-medium ml-auto">{game.publisher}</span>
              </div>
            )}
            {game.releaseYear && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground pl-[22px]">출시년도</span>
                <span className="text-foreground font-medium ml-auto">{game.releaseYear}년</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <RecordButton game={game} isLoggedIn={!!user} existingRecord={existingRecord} existingReview={existingReview} />
        <WishlistButton
          gameId={game.id}
          initialWishlisted={isWishlisted}
          initialCount={game.wishlistCount}
          isLoggedIn={!!user}
          alwaysVisible
        />
      </div>

      {/* Venues */}
      {venues.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
            <MapPin size={14} /> 플레이 가능한 곳
          </h2>
          <div className="space-y-2">
            {venues.map(venue => (
              <div key={venue.id} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{venue.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {VENUE_TYPE_LABEL[venue.type]} · {venue.district} · ★ {venue.avgRating}
                  </p>
                </div>
                {venue.reservationUrl && (
                  <a
                    href={venue.reservationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 rounded border border-primary/50 text-primary hover:bg-primary/10 transition-colors"
                  >
                    예약
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <ReviewsSection reviews={reviews} myReview={existingReview ?? null} isLoggedIn={!!user} />
    </div>
  )
}
