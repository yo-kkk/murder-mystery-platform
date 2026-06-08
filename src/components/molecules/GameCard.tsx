import Link from 'next/link'
import { Users, Clock, Skull } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/atoms/StarRating'
import { cn, DIFFICULTY_LABEL, DIFFICULTY_COLOR, THEME_LABEL, formatDuration } from '@/lib/utils'
import type { Game } from '@/types'

interface GameCardProps {
  game: Game
  isPlayed?: boolean
  className?: string
}

export function GameCard({ game, isPlayed, className }: GameCardProps) {
  return (
    <Link href={`/games/${game.id}`}>
      <div
        className={cn(
          'group relative rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden',
          'hover:border-primary/60 hover:bg-[var(--card-hover,#1E1E38)] transition-all duration-200',
          'cursor-pointer',
          className
        )}
        style={{ '--card-hover': '#1E1E38' } as React.CSSProperties}
      >
        {/* Image area */}
        <div className="relative h-36 bg-gradient-to-br from-[var(--card)] to-black/80 flex items-center justify-center">
          <Skull
            size={48}
            className="text-primary/30 group-hover:text-primary/50 transition-colors"
          />
          {isPlayed && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-primary/90 text-white text-xs">플레이함</Badge>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] to-transparent" />
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          <div>
            <h3 className="font-semibold text-foreground text-sm leading-tight">{game.title}</h3>
            {game.subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{game.subtitle}</p>
            )}
          </div>

          <StarRating rating={game.avgRating} size="sm" />

          <div className="flex flex-wrap gap-1">
            {game.themes.slice(0, 2).map(theme => (
              <Badge key={theme} variant="outline" className="text-xs border-[var(--border)] text-muted-foreground">
                {THEME_LABEL[theme]}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <Users size={11} />
              {game.minPlayers}~{game.maxPlayers}인
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {formatDuration(game.durationMinutes)}
            </span>
            <span className={cn('ml-auto font-medium', DIFFICULTY_COLOR[game.difficulty])}>
              {DIFFICULTY_LABEL[game.difficulty]}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
