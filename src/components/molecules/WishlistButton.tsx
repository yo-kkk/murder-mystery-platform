'use client'

import { useState } from 'react'
import { Heart, Star } from 'lucide-react'
import { toggleWishlist } from '@/app/actions/wishlist'

interface Props {
  gameId: string
  initialInterested: boolean
  initialRecommended: boolean
  interestCount?: number
  recommendCount?: number
  isLoggedIn: boolean
  alwaysVisible?: boolean
}

export function WishlistButton({
  gameId,
  initialInterested,
  initialRecommended,
  interestCount = 0,
  recommendCount = 0,
  isLoggedIn,
  alwaysVisible = false,
}: Props) {
  const [interested, setInterested] = useState(initialInterested)
  const [recommended, setRecommended] = useState(initialRecommended)
  const [iCount, setICount] = useState(interestCount)
  const [rCount, setRCount] = useState(recommendCount)
  const [pendingType, setPendingType] = useState<'interest' | 'recommend' | null>(null)

  async function handleClick(e: React.MouseEvent, type: 'interest' | 'recommend') {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoggedIn || pendingType) return
    setPendingType(type)

    if (type === 'interest') {
      const next = !interested
      setInterested(next)
      setICount(c => next ? c + 1 : Math.max(0, c - 1))
      const result = await toggleWishlist(gameId, 'interest')
      if (result.error) {
        setInterested(p => !p)
        setICount(c => next ? Math.max(0, c - 1) : c + 1)
      }
    } else {
      const next = !recommended
      setRecommended(next)
      setRCount(c => next ? c + 1 : Math.max(0, c - 1))
      const result = await toggleWishlist(gameId, 'recommend')
      if (result.error) {
        setRecommended(p => !p)
        setRCount(c => next ? Math.max(0, c - 1) : c + 1)
      }
    }
    setPendingType(null)
  }

  const disabledClass = !isLoggedIn ? 'opacity-40 cursor-not-allowed' : ''

  if (alwaysVisible) {
    return (
      <>
        <button
          onClick={e => handleClick(e, 'interest')}
          disabled={!isLoggedIn || !!pendingType}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-sm transition-colors ${disabledClass} ${
            interested
              ? 'border-red-500/70 text-red-400 bg-red-500/10'
              : 'border-[var(--border)] bg-[var(--card)] text-muted-foreground hover:border-red-500/40 hover:text-red-400'
          }`}
        >
          <Heart size={15} className={interested ? 'fill-red-400' : ''} />
          관심
          {iCount > 0 && <span className="text-xs">{iCount}</span>}
        </button>
        <button
          onClick={e => handleClick(e, 'recommend')}
          disabled={!isLoggedIn || !!pendingType}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-sm transition-colors ${disabledClass} ${
            recommended
              ? 'border-yellow-500/70 text-yellow-400 bg-yellow-500/10'
              : 'border-[var(--border)] bg-[var(--card)] text-muted-foreground hover:border-yellow-500/40 hover:text-yellow-400'
          }`}
        >
          <Star size={15} className={recommended ? 'fill-yellow-400' : ''} />
          추천
          {rCount > 0 && <span className="text-xs">{rCount}</span>}
        </button>
      </>
    )
  }

  // 카드 오버레이용
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={e => handleClick(e, 'interest')}
        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-all ${
          interested
            ? 'bg-red-500/15 text-red-400'
            : 'text-muted-foreground hover:text-red-400'
        }`}
      >
        <Heart size={11} className={interested ? 'fill-red-400' : ''} />
        관심
      </button>
      <button
        onClick={e => handleClick(e, 'recommend')}
        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-all ${
          recommended
            ? 'bg-yellow-500/15 text-yellow-400'
            : 'text-muted-foreground hover:text-yellow-400'
        }`}
      >
        <Star size={11} className={recommended ? 'fill-yellow-400' : ''} />
        추천
      </button>
    </div>
  )
}
