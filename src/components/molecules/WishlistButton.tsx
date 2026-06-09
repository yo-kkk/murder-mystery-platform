'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { toggleWishlist } from '@/app/actions/wishlist'

interface Props {
  gameId: string
  initialWishlisted: boolean
  initialCount: number
  isLoggedIn: boolean
  alwaysVisible?: boolean
}

export function WishlistButton({ gameId, initialWishlisted, initialCount, isLoggedIn, alwaysVisible = false }: Props) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted)
  const [count, setCount] = useState(initialCount)
  const [pending, setPending] = useState(false)

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoggedIn || pending) return
    setPending(true)
    const next = !wishlisted
    setWishlisted(next)
    setCount(c => next ? c + 1 : Math.max(0, c - 1))
    const result = await toggleWishlist(gameId)
    if (result.error) {
      setWishlisted(p => !p)
      setCount(c => next ? Math.max(0, c - 1) : c + 1)
    }
    setPending(false)
  }

  // 상세 페이지용: 외곽 border에 하이라이트, 텍스트 없이 heart + count만
  if (alwaysVisible) {
    return (
      <button
        onClick={handleClick}
        disabled={!isLoggedIn || pending}
        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-sm transition-colors ${
          wishlisted
            ? 'border-red-500/70 text-red-400 bg-red-500/10'
            : !isLoggedIn
            ? 'border-[var(--border)] bg-[var(--card)] text-muted-foreground/40 cursor-not-allowed'
            : 'border-[var(--border)] bg-[var(--card)] text-muted-foreground hover:border-red-500/40 hover:text-red-400'
        }`}
      >
        <Heart size={15} className={wishlisted ? 'fill-red-400' : ''} />
        {count > 0 && <span>{count}</span>}
      </button>
    )
  }

  // 카드 오버레이용: 항상 표시, count 0이면 숫자만 숨김
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleClick}
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
          wishlisted
            ? 'bg-red-500/90 text-white'
            : 'bg-black/40 text-white/70 hover:bg-black/60 hover:text-white'
        }`}
      >
        <Heart size={13} className={wishlisted ? 'fill-white' : ''} />
      </button>
      {(count > 0 || wishlisted) && (
        <span className="text-[10px] text-white/80 font-medium bg-black/40 rounded-full px-1.5 py-0.5">
          {count}
        </span>
      )}
    </div>
  )
}
