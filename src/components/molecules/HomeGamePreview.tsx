'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowUpDown, Check, ChevronRight } from 'lucide-react'
import { sortGames, type GameSortKey } from '@/lib/utils'
import { GameCard } from './GameCard'
import { WishlistButton } from './WishlistButton'
import type { Game } from '@/types'

type SortKey = GameSortKey
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'rating', label: '평점순' },
  { key: 'reviews', label: '평가 많은순' },
  { key: 'newest', label: '최신순' },
  { key: 'wishlist', label: '찜 많은순' },
]

interface Props {
  games: Game[]
  wishlistedIds?: string[]
  isLoggedIn?: boolean
}

export function HomeGamePreview({ games, wishlistedIds = [], isLoggedIn = false }: Props) {
  const [sort, setSort] = useState<SortKey>('rating')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const sorted = sortGames(games, sort).slice(0, 6)

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          추천 머더 미스터리
        </h2>
        {isLoggedIn && (
          <div ref={ref} className="relative">
            <button
              onClick={() => setOpen(p => !p)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowUpDown size={12} />
              {SORT_OPTIONS.find(o => o.key === sort)?.label}
            </button>
            {open && (
              <div className="absolute right-0 top-full mt-1 z-10 min-w-[100px] rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg overflow-hidden">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => { setSort(opt.key); setOpen(false) }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-[var(--background)] transition-colors"
                  >
                    <span className={sort === opt.key ? 'text-primary font-medium' : 'text-foreground'}>
                      {opt.label}
                    </span>
                    {sort === opt.key && <Check size={11} className="text-primary ml-2" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {sorted.map(game => (
          <div key={game.id} className="relative group">
            <GameCard
              game={game}
              overlay={
                <WishlistButton
                  gameId={game.id}
                  initialWishlisted={wishlistedIds.includes(game.id)}
                  initialCount={game.wishlistCount}
                  isLoggedIn={isLoggedIn}
                />
              }
            />
          </div>
        ))}
      </div>

      <Link
        href="/games"
        className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg border border-[var(--border)] bg-white/[0.03] text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-white/[0.06] transition-colors"
      >
        더 많은 머더 미스터리
        <ChevronRight size={14} />
      </Link>
    </section>
  )
}
