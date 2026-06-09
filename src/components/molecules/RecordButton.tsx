'use client'

import { useState } from 'react'
import { BookmarkPlus, PenLine } from 'lucide-react'
import { AddPlayRecordModal } from './AddPlayRecordModal'
import type { Game } from '@/types'

interface PlayRecord {
  id: string
  played_at: string
  venue_name: string | null
  companions: string[]
  memo: string | null
  image_urls: string[]
  is_best: boolean
}

interface ExistingReview {
  id: string
  rating: number
  comment: string | null
  tags: string[]
  is_public: boolean
  is_best?: boolean
  nickname?: string
}

interface Props {
  game: Game
  isLoggedIn: boolean
  existingRecord?: PlayRecord | null
  existingReview?: ExistingReview | null
}

export function RecordButton({ game, isLoggedIn, existingRecord, existingReview }: Props) {
  const [open, setOpen] = useState(false)

  if (!isLoggedIn) {
    return (
      <a
        href="/login"
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <BookmarkPlus size={16} /> 로그인 후 기록하기
      </a>
    )
  }

  if (existingRecord) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-primary/40 text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
        >
          <PenLine size={15} /> 플레이 기록 수정
        </button>

        {open && (
          <AddPlayRecordModal
            game={game}
            onClose={() => setOpen(false)}
            existingRecord={existingRecord}
            existingReview={existingReview}
          />
        )}
      </>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <BookmarkPlus size={16} /> 플레이 기록 작성
      </button>

      {open && (
        <AddPlayRecordModal
          game={game}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
