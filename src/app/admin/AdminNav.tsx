'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/admin', label: '게임 검수' },
  { href: '/admin/feedback', label: '의견' },
  { href: '/admin/photos', label: '사진 선택' },
  { href: '/admin/reports', label: '신고' },
  { href: '/admin/game-edits', label: '수정 요청' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
      {TABS.map(({ href, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              active
                ? 'bg-amber-500/20 border border-amber-500/60 text-amber-400'
                : 'border border-transparent text-muted-foreground hover:text-foreground hover:border-[var(--border)]'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
