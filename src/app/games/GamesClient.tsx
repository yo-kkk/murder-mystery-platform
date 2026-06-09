'use client'

import { useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, ArrowUpDown, Check, SlidersHorizontal, X, Plus, Heart } from 'lucide-react'
import { sortGames, type GameSortKey } from '@/lib/utils'
import { GameCard } from '@/components/molecules/GameCard'
import { WishlistButton } from '@/components/molecules/WishlistButton'
import { AddPlayRecordModal } from '@/components/molecules/AddPlayRecordModal'
import { Pagination } from '@/components/atoms/Pagination'
import { useClickOutside } from '@/hooks/useClickOutside'
import { SubmitGameModal } from '@/components/molecules/SubmitGameModal'
import type { Game } from '@/types'

const PAGE_SIZE_OPTIONS = [10, 20]

type SortKey = GameSortKey
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'rating', label: '평점순' },
  { key: 'reviews', label: '평가 많은순' },
  { key: 'newest', label: '최신순' },
  { key: 'title', label: '가나다순' },
]

const DURATION_OPTIONS = [
  { label: '~1시간', min: 0, max: 60 },
  { label: '1~2시간', min: 60, max: 120 },
  { label: '2시간~', min: 120, max: Infinity },
]

const PLAYER_OPTIONS = [2, 3, 4, 5, 6, 7]

interface Props {
  games: Game[]
  playedIds: string[]
  wishlistedIds: string[]
  isLoggedIn: boolean
}

export function GamesClient({ games, playedIds, wishlistedIds, isLoggedIn }: Props) {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sort, setSort] = useState<SortKey>('rating')
  const [sortOpen, setSortOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [durationFilter, setDurationFilter] = useState<number | null>(null)
  const [playerFilter, setPlayerFilter] = useState<number | null>(null)
  const [wishlistFilter, setWishlistFilter] = useState(() => searchParams.get('wishlist') === 'true')
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)

  useClickOutside(
    { ref: sortRef, close: () => setSortOpen(false) },
    { ref: filterRef, close: () => setFilterOpen(false) }
  )

  const filtered = games.filter(g => {
    if (wishlistFilter && !wishlistedIds.includes(g.id)) return false
    if (query.trim() && !g.title.toLowerCase().includes(query.toLowerCase())) return false
    if (durationFilter !== null) {
      const opt = DURATION_OPTIONS[durationFilter]
      const dur = g.durationMinutes
      if (dur < opt.min || dur > opt.max) return false
    }
    if (playerFilter !== null) {
      if (playerFilter === 7) {
        if (g.maxPlayers < 7) return false
      } else {
        if (playerFilter < g.minPlayers || playerFilter > g.maxPlayers) return false
      }
    }
    return true
  })

  const sorted = sortGames(filtered, sort)

  const totalPages = Math.ceil(sorted.length / pageSize)
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)
  const activeFilterCount = (durationFilter !== null ? 1 : 0) + (playerFilter !== null ? 1 : 0)

  function handleQueryChange(value: string) { setQuery(value); setPage(1) }
  function handlePageSizeChange(size: number) { setPageSize(size); setPage(1) }
  function handleSortChange(key: SortKey) { setSort(key); setSortOpen(false); setPage(1) }
  function clearFilters() { setDurationFilter(null); setPlayerFilter(null); setPage(1) }
  function toggleWishlistFilter() { setWishlistFilter(p => !p); setPage(1) }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-foreground">머더 미스터리 검색</h1>
          <p className="text-sm text-muted-foreground">{games.length}개의 게임</p>
        </div>
        <button
          onClick={() => setShowSubmitModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors whitespace-nowrap"
        >
          <Plus size={14} />
          새로운 머미 추가
        </button>
      </div>

      {/* Search + Filter + Sort */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              placeholder="머더 미스터리 검색..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--border)] text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>

        {/* Filter */}
        <div ref={filterRef} className="relative">
          <button
            onClick={() => setFilterOpen(p => !p)}
            className={`relative flex items-center gap-1.5 px-3 py-2.5 rounded-lg border text-sm transition-colors whitespace-nowrap ${
              activeFilterCount > 0
                ? 'border-primary/60 text-primary bg-primary/5'
                : 'border-[var(--border)] bg-[var(--card)] text-muted-foreground hover:text-foreground hover:border-primary/40'
            }`}
          >
            <SlidersHorizontal size={13} />
            필터
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {filterOpen && (
            <div className="absolute right-0 top-full mt-1 z-10 w-56 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg p-3 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">필터</span>
                <button onClick={() => setFilterOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X size={14} />
                </button>
              </div>
              {/* Duration */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">소요 시간</p>
                <div className="flex flex-wrap gap-1.5">
                  {DURATION_OPTIONS.map((opt, i) => (
                    <button
                      key={opt.label}
                      onClick={() => { setDurationFilter(durationFilter === i ? null : i); setPage(1) }}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        durationFilter === i
                          ? 'border-primary text-primary bg-primary/10'
                          : 'border-[var(--border)] text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Players */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">인원</p>
                <div className="flex flex-wrap gap-1.5">
                  {PLAYER_OPTIONS.map(n => (
                    <button
                      key={n}
                      onClick={() => { setPlayerFilter(playerFilter === n ? null : n); setPage(1) }}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        playerFilter === n
                          ? 'border-primary text-primary bg-primary/10'
                          : 'border-[var(--border)] text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      }`}
                    >
                      {n === 7 ? '7인이상' : `${n}인`}
                    </button>
                  ))}
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground pt-1 border-t border-[var(--border)] transition-colors"
                >
                  <X size={11} /> 필터 초기화
                </button>
              )}
            </div>
          )}
        </div>
        </div>

        <div className="flex gap-2 justify-end">
          {/* Wishlist filter */}
          {isLoggedIn && (
            <button
              onClick={toggleWishlistFilter}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg border text-sm transition-colors whitespace-nowrap ${
                wishlistFilter
                  ? 'border-red-500/60 text-red-400 bg-red-500/10'
                  : 'border-[var(--border)] bg-[var(--card)] text-muted-foreground hover:text-foreground hover:border-primary/40'
              }`}
            >
              <Heart size={13} className={wishlistFilter ? 'fill-red-400' : ''} />
              찜 목록
            </button>
          )}

          {/* Sort */}
          <div ref={sortRef} className="relative">
            <button
              onClick={() => setSortOpen(p => !p)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors whitespace-nowrap"
            >
              <ArrowUpDown size={13} />
              {SORT_OPTIONS.find(o => o.key === sort)?.label}
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1 z-10 min-w-[110px] rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg overflow-hidden">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => handleSortChange(opt.key)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-[var(--background)] transition-colors"
                  >
                    <span className={sort === opt.key ? 'text-primary font-medium' : 'text-foreground'}>
                      {opt.label}
                    </span>
                    {sort === opt.key && <Check size={12} className="text-primary ml-2" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {sorted.length === 0 ? (
        wishlistFilter ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center space-y-4">
            <p className="text-sm text-muted-foreground">찜 목록이 비어있어요</p>
            <button
              onClick={() => { setWishlistFilter(false); setPage(1) }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Search size={14} />
              머더 미스터리 찾아보기
            </button>
          </div>
        ) : (
          <p className="text-center text-muted-foreground text-sm py-12">검색 결과가 없어요</p>
        )
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {paginated.map(game => (
              <div key={game.id} className="relative group">
                <GameCard
                  game={game}
                  isPlayed={playedIds.includes(game.id)}
                  overlay={
                    <WishlistButton
                      gameId={game.id}
                      initialWishlisted={wishlistedIds.includes(game.id)}
                      initialCount={game.wishlistCount}
                      isLoggedIn={isLoggedIn}
                    />
                  }
                />
                {isLoggedIn && !playedIds.includes(game.id) && (
                  <button
                    onClick={() => setSelectedGame(game)}
                    className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-primary text-white text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    기록하기
                  </button>
                )}
              </div>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}

      {selectedGame && (
        <AddPlayRecordModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      )}
      {showSubmitModal && (
        <SubmitGameModal onClose={() => setShowSubmitModal(false)} />
      )}
    </div>
  )
}
