import { Search, SlidersHorizontal } from 'lucide-react'
import { GameCard } from '@/components/molecules/GameCard'
import { Badge } from '@/components/ui/badge'
import { getGames } from '@/lib/supabase/queries'

export const revalidate = 60

export default async function HomePage() {
  const games = await getGames()

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center py-8 space-y-3">
        <h1
          className="text-3xl font-bold tracking-widest uppercase"
          style={{ color: 'var(--gold)', fontFamily: 'Georgia, serif' }}
        >
          Murder Mystery
        </h1>
        <p className="text-muted-foreground text-sm">
          플레이한 게임을 기록하고, 평가하고, 새로운 사건을 찾아보세요
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="게임 검색..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--border)] text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--border)] text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors text-sm">
          <SlidersHorizontal size={15} />
          필터
        </button>
      </div>

      {/* Filter badges */}
      <div className="flex flex-wrap gap-2">
        {['전체', '공포', '빅토리안', '역사', '판타지', 'SF', '현대'].map(tag => (
          <Badge
            key={tag}
            variant={tag === '전체' ? 'default' : 'outline'}
            className={
              tag === '전체'
                ? 'bg-primary text-white cursor-pointer'
                : 'border-[var(--border)] text-muted-foreground cursor-pointer hover:border-primary/50 hover:text-foreground transition-colors'
            }
          >
            {tag}
          </Badge>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '전체 게임', value: games.length },
          { label: '내가 플레이', value: '-' },
          { label: '이번 달 추가', value: '-' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-center">
            <div className="text-xl font-bold text-primary">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Game grid */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          모든 게임 <span className="text-primary">{games.length}</span>
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {games.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>
    </div>
  )
}
