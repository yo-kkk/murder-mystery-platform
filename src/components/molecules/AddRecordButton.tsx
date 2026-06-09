'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Search, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/browser'
import { AddPlayRecordModal } from './AddPlayRecordModal'
import type { Game } from '@/types'

export function AddRecordButton() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Game[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50)
    else { setQuery(''); setResults([]) }
  }, [searchOpen])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const q = query.trim()
    if (!q) { setResults([]); return }

    timerRef.current = setTimeout(async () => {
      setLoading(true)
      const supabase = createClient()
      const norm = q.replace(/\s+/g, '')
      const { data } = await supabase
        .from('games')
        .select('id, short_id, title, subtitle, description, min_players, max_players, duration_minutes, max_duration_minutes, requires_gm, avg_rating, bayesian_rating, review_count, wishlist_count, publisher, release_year')
        .ilike('title', `%${q}%`)
        .limit(20)

      // 공백 제거 후 추가 필터
      const filtered = (data ?? []).filter((g: any) =>
        g.title.toLowerCase().replace(/\s+/g, '').includes(norm.toLowerCase())
      )
      setResults(filtered.map((g: any): Game => ({
        id: g.id,
        shortId: g.short_id,
        title: g.title,
        subtitle: g.subtitle ?? undefined,
        description: g.description ?? '',
        minPlayers: g.min_players,
        maxPlayers: g.max_players,
        durationMinutes: g.duration_minutes,
        maxDurationMinutes: g.max_duration_minutes ?? undefined,
        requiresGm: g.requires_gm,
        avgRating: g.avg_rating,
        bayesianRating: g.bayesian_rating,
        reviewCount: g.review_count,
        wishlistCount: g.wishlist_count,
        publisher: g.publisher ?? undefined,
        releaseYear: g.release_year ?? undefined,
      })))
      setLoading(false)
    }, 300)
  }, [query])

  function handleSelect(game: Game) {
    setSelectedGame(game)
    setSearchOpen(false)
  }

  const modal = searchOpen ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
      <div className="relative w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">어떤 머미를 기록할까요?</p>
          <button onClick={() => setSearchOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="게임 이름으로 검색..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors"
          />
        </div>

        <div className="max-h-64 overflow-y-auto space-y-1">
          {loading && (
            <div className="flex justify-center py-6">
              <Loader2 size={18} className="animate-spin text-muted-foreground" />
            </div>
          )}
          {!loading && query.trim() && results.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">검색 결과가 없어요</p>
          )}
          {!loading && results.map(game => (
            <button
              key={game.id}
              onClick={() => handleSelect(game)}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[var(--secondary)] transition-colors"
            >
              <p className="text-sm font-medium text-foreground">{game.title}</p>
              {game.subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5">{game.subtitle}</p>
              )}
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                {game.minPlayers}~{game.maxPlayers}인 · {game.durationMinutes}분
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        onClick={() => setSearchOpen(true)}
        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
      >
        <Plus size={13} />
        플레이 기록 추가
      </button>

      {typeof document !== 'undefined' && modal
        ? createPortal(modal, document.body)
        : null}

      {selectedGame && (
        <AddPlayRecordModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </>
  )
}
