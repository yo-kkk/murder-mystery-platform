'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV } from '@/lib/nav'

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 border-t border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV.map(({ href, label, icon: Icon, match }) => {
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
