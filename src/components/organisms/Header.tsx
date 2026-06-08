'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Skull, BookOpen, MapPin, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/', label: '탐색', icon: Skull },
  { href: '/my-records', label: '내 기록', icon: BookOpen },
  { href: '/venues', label: '장소', icon: MapPin },
  { href: '/profile', label: '프로필', icon: User },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Skull size={22} className="text-primary group-hover:text-primary/80 transition-colors" />
          <span
            className="font-bold text-base tracking-widest uppercase"
            style={{ color: 'var(--gold)', fontFamily: 'Georgia, serif' }}
          >
            Murder<span className="text-primary">Mystery</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors',
                pathname === href
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              )}
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
