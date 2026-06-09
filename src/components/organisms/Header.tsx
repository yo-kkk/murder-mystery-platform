'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, BookOpen, MapPin, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/browser'
import { useEffect, useState } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const NAV = [
  { href: '/games', label: '검색', icon: Search, match: (p: string) => p === '/games' || p.startsWith('/games/') },
  { href: '/my-records', label: '내 기록', icon: BookOpen, match: (p: string) => p.startsWith('/my-records') },
  { href: '/venues', label: '장소', icon: MapPin, match: (p: string) => p.startsWith('/venues') },
  { href: '/profile', label: '프로필', icon: User, match: (p: string) => p.startsWith('/profile') },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-sm">
      <div className="px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group">
          <span
            className="font-semibold text-lg tracking-tight"
            style={{ color: 'var(--gold)', fontFamily: 'var(--font-serif)' }}
          >
            어제의 <span className="text-primary">머미</span>
          </span>
        </Link>

        {/* Desktop nav + auth */}
        <div className="hidden md:flex items-center gap-1">
          {NAV.map(({ href, label, icon: Icon, match }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors',
                match(pathname)
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              )}
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}

          <div className="ml-2 pl-2 border-l border-[var(--border)]">
            {user ? (
              <button
                onClick={handleLogout}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5"
              >
                로그아웃
              </button>
            ) : (
              <Link
                href="/login"
                className="text-sm text-primary hover:text-primary/80 transition-colors font-medium px-2 py-1.5"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
