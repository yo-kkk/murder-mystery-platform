'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Props {
  nickname: string
  rating: number
  comment: string | null
  tags: string[]
  createdAt: string
  isBest?: boolean
  isMyReview?: boolean
}

export function ReviewCard({ nickname, rating, comment, tags, createdAt, isBest, isMyReview }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-medium ${nickname === '(비공개 유저)' ? 'text-muted-foreground/50 italic' : 'text-foreground'}`}>
            {nickname}
          </span>
          {isMyReview && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-primary/50 text-primary/80 leading-none">내 리뷰</span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground/50">{formatDate(createdAt)}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {[1,2,3,4,5].map(s => (
            <Star
              key={s}
              size={13}
              className={s <= rating ? 'fill-[var(--gold)] text-[var(--gold)]' : 'text-muted-foreground/20'}
            />
          ))}
        </div>
        {isBest && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/15 border border-yellow-400/50 text-yellow-400">
            👑 인생 머미
          </span>
        )}
      </div>

      {tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags?.map((tag: string) => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted-foreground/10 text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      )}

      {comment && (
        <div>
          <button
            onClick={() => setOpen(p => !p)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            한줄평 {open ? '▲' : '▼'}
          </button>
          {open && (
            <p className="text-sm text-muted-foreground leading-relaxed mt-1.5 bg-[var(--background)] rounded-lg px-3 py-2">
              {comment}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
