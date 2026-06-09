import Link from 'next/link'
import { Users, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/atoms/StarRating'
import { cn, formatDurationRange } from '@/lib/utils'
import type { Game } from '@/types'

interface GameCardProps {
  game: Game
  isPlayed?: boolean
  className?: string
  overlay?: React.ReactNode
}

export function GameCard({ game, isPlayed, className, overlay }: GameCardProps) {
  return (
    <Link href={`/games/${game.shortId}`}>
      <div
        className={cn(
          'group relative rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden',
          'hover:border-primary/60 transition-all duration-200',
          'cursor-pointer',
          className
        )}
      >
        {/* Content */}
        <div className="p-3 space-y-2">
            {isPlayed && (
            <div className="flex justify-end">
              <Badge className="bg-yellow-500/90 text-black text-xs">졸업</Badge>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-foreground text-base leading-tight">{game.title}</h3>
            {game.subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{game.subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-2 h-4">
            {game.reviewCount >= 3 ? (
              <>
                <StarRating rating={game.bayesianRating} size="sm" />
                <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-[var(--border)] text-muted-foreground">
                  {game.reviewCount}개
                </span>
              </>
            ) : game.reviewCount > 0 ? (
              <>
                <span className="text-xs text-muted-foreground/60">평가 집계 중</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-[var(--border)] text-muted-foreground">
                  {game.reviewCount}개
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground/60">평가 없음</span>
            )}
          </div>

          <div className="space-y-0.5 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <Users size={11} />
              {game.minPlayers === game.maxPlayers
                ? `${game.minPlayers}인`
                : `${game.minPlayers}~${game.maxPlayers}인`}
              {game.requiresGm && (
                <span className="ml-0.5 text-[10px] px-1.5 py-0.5 rounded border border-yellow-500/50 text-yellow-500 leading-none">GM필수</span>
              )}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {formatDurationRange(game.durationMinutes, game.maxDurationMinutes)}
            </span>
          </div>

          {overlay && (
            <div className="pt-1 border-t border-[var(--border)] mt-1" onClick={e => e.preventDefault()}>
              {overlay}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
