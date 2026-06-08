import { BookOpen, Calendar, Users } from 'lucide-react'
import { StarRating } from '@/components/atoms/StarRating'
import { formatDate, VENUE_TYPE_LABEL } from '@/lib/utils'
import type { Game, PlayRecord, Venue } from '@/types'
import gamesData from '../../../mocks/data/games.json'
import recordsData from '../../../mocks/data/play-records.json'
import venuesData from '../../../mocks/data/venues.json'

const games = gamesData as Game[]
const records = recordsData as PlayRecord[]
const venues = venuesData as Venue[]

export default function MyRecordsPage() {
  const enriched = records.map(r => ({
    ...r,
    game: games.find(g => g.id === r.gameId)!,
    venue: venues.find(v => v.id === r.venueId),
  })).filter(r => r.game)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <BookOpen size={20} className="text-primary" />
          내 플레이 기록
        </h1>
        <p className="text-sm text-muted-foreground">총 {enriched.length}개의 게임을 플레이했어요</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '플레이 횟수', value: enriched.length },
          { label: '리뷰 작성', value: enriched.filter(r => r.myReviewId).length },
          { label: '함께한 사람', value: [...new Set(enriched.flatMap(r => r.companions))].length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-center">
            <div className="text-xl font-bold text-primary">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Records list */}
      <div className="space-y-3">
        {enriched.map(record => (
          <div key={record.id} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
            {/* Game title */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{record.game.title}</h3>
                <StarRating rating={record.game.avgRating} size="sm" className="mt-1" />
              </div>
              {!record.myReviewId && (
                <button className="text-xs px-2 py-1 rounded border border-primary/50 text-primary hover:bg-primary/10 transition-colors">
                  리뷰 쓰기
                </button>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {formatDate(record.playedAt)}
              </span>
              {record.venue && (
                <span className="flex items-center gap-1">
                  📍 {record.venue.name} ({VENUE_TYPE_LABEL[record.venue.type]})
                </span>
              )}
              {record.companions.length > 0 && (
                <span className="flex items-center gap-1">
                  <Users size={11} />
                  {record.companions.join(', ')}와 함께
                </span>
              )}
            </div>

            {!record.isPublic && (
              <span className="text-xs text-muted-foreground/60">🔒 비공개</span>
            )}
          </div>
        ))}
      </div>

      {/* Add button */}
      <button className="w-full py-3 rounded-lg border border-dashed border-[var(--border)] text-muted-foreground text-sm hover:border-primary/50 hover:text-foreground transition-colors">
        + 새 플레이 기록 추가
      </button>
    </div>
  )
}
