'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme, type Theme } from '@/components/providers/ThemeProvider'

const OPTIONS: { value: Theme; icon: React.ReactNode; label: string }[] = [
  { value: 'light', icon: <Sun size={14} />, label: '라이트' },
  { value: 'dark', icon: <Moon size={14} />, label: '다크' },
  { value: 'system', icon: <Monitor size={14} />, label: '시스템' },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex gap-1.5">
      {OPTIONS.map(({ value, icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
            theme === value
              ? 'bg-primary/15 border-primary/60 text-primary'
              : 'border-[var(--border)] text-muted-foreground hover:border-primary/30 hover:text-foreground'
          }`}
        >
          {icon}
          {label}
        </button>
      ))}
    </div>
  )
}
