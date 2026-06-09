'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface Props {
  value: number
  onChange: (value: number) => void
  size?: number
}

export function StarPicker({ value, onChange, size = 28 }: Props) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= (hovered || value)
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={size}
              className={filled ? 'fill-[var(--gold)] text-[var(--gold)]' : 'text-muted-foreground/40'}
            />
          </button>
        )
      })}
      {value > 0 && (
        <span className="ml-1 text-sm text-[var(--gold)] font-medium self-center">
          {['', '별로예요', '그저 그래요', '나쁘지 않아요', '좋아요', '최고예요'][value]}
        </span>
      )}
    </div>
  )
}
