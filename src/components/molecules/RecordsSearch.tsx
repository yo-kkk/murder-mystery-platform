'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Check, SlidersHorizontal, X } from 'lucide-react'
import { RecordCard } from './RecordCard'

interface Props {
  records: any[]
  reviewMap: Record<string, any>
}

const PAGE_SIZE_OPTIONS = [3, 5, 10]

type SortKey = 'newest' | 'oldest' | 'rating' | 'best'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: '최신순' },
  { key: 'oldest', label: '오래된순' },
  { key: 'rating', label: '평점순' },
  { key: 'best', label: '👑' },
]

const DURATION_OPTIONS = [
  { label: '~1시간', min: 0, max: 60 },
  { label: '1~2시간', min: 60, max: 120 },
  { label: '2시간~', min: 120, max: Infinity },
]

const PLAYER_OPTIONS = [2, 3, 4, 5, 6, 7]
const RATING_OPTIONS = [1, 2, 3, 4, 5]

export function RecordsSearch({ records, reviewMap }: Props) {
  const [query, setQuery] = useState('')
  const [pageSize, setPageSize] = useState(5)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<SortKey>('newest')
  const [sortOpen, setSortOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [durationFilter, setDurationFilter] = useState<number | null>(null)
  const [playerFilter, setPlayerFilter] = useState<number | null>(null)
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)
  const sortRef = useRef<HTMLDivElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const activeFilterCount = (durationFilter !== null ? 1 : 0) + (playerFilter !== null ? 1 : 0) + (ratingFilter !== null ? 1 : 0)

  const filtered = records.filter(r => {
    if (query.trim() && !(
      r.game.title.toLowerCase().includes(query.toLowerCase()) ||
      r.memo?.toLowerCase().includes(query.toLowerCase()) ||
      r.venue_name?.toLowerCase().includes(query.toLowerCase()) ||
      r.companions?.some((c: string) => c.toLowerCase().includes(query.toLowerCase()))
    )) return false
    if (durationFilter !== null) {
      const opt = DURATION_OPTIONS[durationFilter]
      const dur = r.game.duration_minutes ?? 0
      if (dur < opt.min || dur > opt.max) return false
    }
    if (playerFilter !== null) {
      const min = r.game.min_players ?? 1
      const max = r.game.max_players ?? 99
      if (playerFilter === 7) {
        if (max < 7) return false
      } else {
        if (playerFilter < min || playerFilter > max) return false
      }
    }
    if (ratingFilter !== null) {
      const myRating = reviewMap[r.game.id]?.rating ?? null
      if (myRating !== ratingFilter) return false
    }
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'oldest') return new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
    if (sort === 'rating') {
      const ra = reviewMap[a.game.id]?.rating ?? 0
      const rb = reviewMap[b.game.id]?.rating ?? 0
      return rb - ra
    }
    if (sort === 'best') {
      if (b.is_best !== a.is_best) return b.is_best ? 1 : -1
      return new Date(b.played_at).getTime() - new Date(a.played_at).getTime()
    }
    return new Date(b.played_at).getTime() - new Date(a.played_at).getTime()
  })

  const totalPages = Math.ceil(sorted.length / pageSize)
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  function handleQueryChange(value: string) { setQuery(value); setPage(1) }
  function handlePageSizeChange(size: number) { setPageSize(size); setPage(1) }
  function handleSortChange(key: SortKey) { setSort(key); setSortOpen(false); setPage(1) }
  function clearFilters() { setDurationFilter(null); setPlayerFilter(null); setRatingFilter(null); setPage(1) }

  return (
    <div className="space-y-4">
      {/* Search + Filter + Sort */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            placeholder="게임명, 장소, 동행 검색..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors"
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

              {/* Rating */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">내 평점</p>
                <div className="flex flex-wrap gap-1.5">
                  {RATING_OPTIONS.map(n => (
                    <button
                      key={n}
                      onClick={() => { setRatingFilter(ratingFilter === n ? null : n); setPage(1) }}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        ratingFilter === n
                          ? 'border-primary text-primary bg-primary/10'
                          : 'border-[var(--border)] text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      }`}
                    >
                      {'★'.repeat(n)}
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

        {/* Sort */}
        <div ref={sortRef} className="relative">
          <button
            onClick={() => setSortOpen(p => !p)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg border text-sm transition-colors whitespace-nowrap ${
              sort !== 'newest'
                ? 'border-primary/60 text-primary bg-primary/5'
                : 'border-[var(--border)] text-muted-foreground bg-[var(--card)] hover:text-foreground hover:border-primary/40'
            }`}
          >
            <ArrowUpDown size={13} />
            {SORT_OPTIONS.find(o => o.key === sort)?.label}
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full mt-1 z-10 min-w-[100px] rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg overflow-hidden">
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

      {/* Results count */}
      {(query || activeFilterCount > 0) && (
        <p className="text-xs text-muted-foreground">
          {sorted.length}개의 결과
        </p>
      )}

      {/* Records */}
      {paginated.length === 0 ? (
        activeFilterCount > 0 || query ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center space-y-4">
            <p className="text-sm text-muted-foreground">조건에 맞는 게임이 없어요</p>
            <a
              href="/games"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Search size={14} />
              머더 미스터리 찾아보기
            </a>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center space-y-4">
            <p className="text-sm text-muted-foreground">기록된 사건이 없어요</p>
            <a
              href="/games"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Search size={14} />
              머더 미스터리 찾아보기
            </a>
          </div>
        )
      ) : (
        <div className="space-y-3">
          {paginated.map((record: any) => (
            <RecordCard
              key={record.id}
              record={record}
              game={record.game}
              review={reviewMap[record.game.id] ?? null}
            />
          ))}
        </div>
      )}

      {/* Pagination + page size */}
      {filtered.length > 0 && (
        <div className="relative flex items-center justify-center">
          <div className="absolute right-0">
            <select
              value={pageSize}
              onChange={e => handlePageSizeChange(Number(e.target.value))}
              className="px-2 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-xs text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>{size}개씩 보기</option>
              ))}
            </select>
          </div>

          {totalPages >= 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded border border-[var(--border)] text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={13} />
              </button>
              {(() => {
                const groupStart = Math.floor((page - 1) / 5) * 5 + 1
                const groupEnd = Math.min(groupStart + 4, totalPages)
                return Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => groupStart + i).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-6 h-6 rounded text-xs transition-colors ${
                      p === page
                        ? 'bg-primary text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {p}
                  </button>
                ))
              })()}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 rounded border border-[var(--border)] text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
