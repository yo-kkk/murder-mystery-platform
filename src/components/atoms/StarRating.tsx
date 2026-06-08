'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

const sizeMap = { sm: 12, md: 16, lg: 20 }

export function StarRating({ rating, maxRating = 5, size = 'sm', showValue = true, className }: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {Array.from({ length: maxRating }).map((_, i) => (
          <Star
            key={i}
            size={sizeMap[size]}
            className={i < Math.round(rating) ? 'fill-[var(--gold)] text-[var(--gold)]' : 'text-muted-foreground'}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-[var(--gold)] font-medium" style={{ fontSize: sizeMap[size] + 2 }}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
