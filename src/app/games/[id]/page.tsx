import { notFound } from 'next/navigation'
import { ArrowLeft, Users, Clock, MapPin, BookmarkPlus } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/atoms/StarRating'
import { DIFFICULTY_LABEL, DIFFICULTY_COLOR, THEME_LABEL, VENUE_TYPE_LABEL, formatDuration } from '@/lib/utils'
import { getGame, getGames, getVenuesByGame } from '@/lib/supabase/queries'

export const revalidate = 60

export async function generateStaticParams() {
  const games = await getGames()
  return games.map(g => ({ id: g.id }))
}

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [game, venues] = await Promise.all([getGame(id), getVenuesByGame(id)])

  if (!game) notFound()

  return (
    <div className="space-y-6 max-w-2xl">
      <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors w-fit">
        <ArrowLeft size={15} /> 목록으로
      </Link>

      {/* Hero */}
      <div className="relative rounded-xl overflow-hidden border border-[var(--border)]">
        <div className="h-48 bg-gradient-to-br from-[var(--card)] via-primary/10 to-black flex items-end p-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Georgia, serif' }}>
              {game.title}
            </h1>
            {game.subtitle && <p className="text-sm text-muted-foreground">{game.subtitle}</p>}
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 space-y-1">
          <StarRating rating={game.avgRating} size="md" />
          <p className="text-xs text-muted-foreground">{game.reviewCount}개의 리뷰</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users size={14} /> {game.minPlayers}~{game.maxPlayers}인
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock size={14} /> {formatDuration(game.durationMinutes)}
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <Badge className={`${DIFFICULTY_COLOR[game.difficulty]} bg-transparent border border-current`}>
          {DIFFICULTY_LABEL[game.difficulty]}
        </Badge>
        {game.themes.map(theme => (
          <Badge key={theme} variant="outline" className="border-[var(--border)] text-muted-foreground">
            {THEME_LABEL[theme]}
          </Badge>
        ))}
      </div>

      {/* Description */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="text-sm font-semibold text-[var(--gold)] mb-2 uppercase tracking-wider">시놉시스</h2>
        <p className="text-sm text-muted-foreground leading-relaxed italic">&ldquo;{game.description}&rdquo;</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
          <BookmarkPlus size={16} /> 플레이 기록 추가
        </button>
        <button className="px-4 py-2.5 rounded-lg border border-[var(--border)] text-muted-foreground text-sm hover:border-primary/50 hover:text-foreground transition-colors">
          ♥ 찜
        </button>
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
                  <button className="text-xs px-3 py-1.5 rounded border border-primary/50 text-primary hover:bg-primary/10 transition-colors">
                    예약
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
