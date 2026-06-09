'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Users, MapPin, Star, Clock } from 'lucide-react'
import { formatDate, formatDurationRange } from '@/lib/utils'
import { AddPlayRecordModal } from './AddPlayRecordModal'

interface Review {
  id: string
  rating: number
  comment: string | null
  tags: string[]
  is_public: boolean
  is_best: boolean
}

interface RecordCardProps {
  record: {
    id: string
    played_at: string
    venue_name: string | null
    companions: string[]
    memo: string | null
    image_urls: string[]
    is_best: boolean
  }
  game: {
    id: string
    short_id: string
    title: string
    avg_rating: number
    min_players: number
    max_players: number
    duration_minutes: number
    max_duration_minutes: number | null
    requires_gm: boolean
  }
  review: Review | null
}

export function RecordCard({ record, game, review }: RecordCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [focusReview, setFocusReview] = useState(false)
  const [memoOpen, setMemoOpen] = useState(false)
  const [commentOpen, setCommentOpen] = useState(false)

  const playedDate = formatDate(record.played_at)
  const playerRange = game.min_players === game.max_players
    ? `${game.min_players}인`
    : `${game.min_players}~${game.max_players}인`
  const duration = formatDurationRange(game.duration_minutes, game.max_duration_minutes ?? undefined)

  const gameForModal = {
    id: game.id,
    shortId: game.short_id,
    title: game.title,
    avgRating: game.avg_rating,
    subtitle: undefined,
    description: '',
    minPlayers: game.min_players,
    maxPlayers: game.max_players,
    durationMinutes: game.duration_minutes,
    maxDurationMinutes: game.max_duration_minutes ?? undefined,
    requiresGm: false,
    publisher: undefined,
    releaseYear: undefined,
    reviewCount: 0,
    bayesianRating: 0,
    wishlistCount: 0,
  }

  return (
    <>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">

        {/* 게임 타이틀 + 수정 버튼 */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/games/${game.short_id}`} className="hover:text-primary transition-colors">
                <h3 className="font-semibold text-foreground leading-snug">{game.title}</h3>
              </Link>
              {record.is_best && (
                <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-yellow-400/15 border border-yellow-400/50 text-yellow-400">
                  👑 내 인생 머미
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
              <span className="flex items-center gap-1">
                <Users size={10} /> {playerRange}
                {game.requires_gm && (
                  <span className="ml-0.5 text-[9px] px-1 py-0.5 rounded border border-yellow-500/50 text-yellow-500 leading-none">GM필수</span>
                )}
              </span>
              <span className="text-muted-foreground/30">·</span>
              <span className="flex items-center gap-1">
                <Clock size={10} /> {duration}
              </span>
            </div>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="shrink-0 text-xs px-2.5 py-1 rounded border border-[var(--border)] text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
          >
            수정
          </button>
        </div>

        {/* 나의 기록 소제목 */}
        <p className="text-xs font-semibold text-muted-foreground">나의 기록</p>

        {/* 플레이 사진 */}
        {record.image_urls?.length > 0 && (
          <div className="flex gap-2">
            {record.image_urls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                className="w-20 h-20 rounded-lg object-cover border border-[var(--border)]"
              />
            ))}
          </div>
        )}

        {/* 플레이 메타 */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar size={11} /> {playedDate}
          </span>
          {record.venue_name && (
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {record.venue_name}
            </span>
          )}
          {record.companions?.length > 0 && (
            <span className="flex items-center gap-1">
              <Users size={11} /> {record.companions.join(', ')}
            </span>
          )}
        </div>

        {/* 메모 */}
        {record.memo && (
          <div>
            <button
              onClick={() => setMemoOpen(p => !p)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              메모 {memoOpen ? '▲' : '▼'}
            </button>
            {memoOpen && (
              <p className="text-sm text-muted-foreground bg-[var(--background)] rounded-lg px-3 py-2 leading-relaxed mt-1">
                {record.memo}
              </p>
            )}
          </div>
        )}

        {/* 나의 평가 */}
        {review ? (
          <div className="border-t border-[var(--border)] pt-3 space-y-2.5">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-muted-foreground">나의 평가</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                review.is_public
                  ? 'border-white/40 text-white/70'
                  : 'border-yellow-500/40 text-yellow-500'
              }`}>
                {review.is_public ? '공개' : '비공개'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star
                    key={s}
                    size={13}
                    className={s <= review.rating ? 'fill-[var(--gold)] text-[var(--gold)]' : 'text-muted-foreground/30'}
                  />
                ))}
              </div>
              {review.is_best && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/15 border border-yellow-400/50 text-yellow-400">
                  👑 인생 머미
                </span>
              )}
            </div>
            {review.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {review.tags?.map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted-foreground/10 text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {review.comment && (
              <div>
                <button
                  onClick={() => setCommentOpen(p => !p)}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  한줄평 {commentOpen ? '▲' : '▼'}
                </button>
                {commentOpen && (
                  <p className="text-sm text-muted-foreground bg-[var(--background)] rounded-lg px-3 py-2 leading-relaxed mt-1">
                    {review.comment}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="border-t border-[var(--border)] pt-3">
            <button
              onClick={() => { setFocusReview(true); setEditOpen(true) }}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              + 리뷰 작성하기
            </button>
          </div>
        )}
      </div>

      {editOpen && (
        <AddPlayRecordModal
          game={gameForModal}
          onClose={() => { setEditOpen(false); setFocusReview(false) }}
          existingRecord={record}
          existingReview={review}
          focusReview={focusReview}
        />
      )}
    </>
  )
}
