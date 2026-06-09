'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV } from '@/lib/nav'
import { createClient } from '@/lib/supabase/browser'
import { useEffect, useState } from 'react'

export function BottomNav() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session?.user)
    })
    return () => subscription.unsubscribe()
  }, [])

  const navItems = NAV.map(item =>
    item.href === '/profile' && !isLoggedIn
      ? { href: '/login', label: '로그인', icon: LogIn, match: (p: string) => p === '/login' }
      : item
  )

  return (
    <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 border-t border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
