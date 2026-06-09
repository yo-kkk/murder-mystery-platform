'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { FeedbackButton } from '@/components/molecules/FeedbackButton'

export function Header() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) {
    return (
      <header className="sticky top-0 z-50 border-b border-amber-500/40 bg-amber-500/10 backdrop-blur-sm">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert size={15} className="text-amber-400" />
            <span className="text-sm font-semibold text-amber-400">어드민 모드</span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={12} />
            일반 페이지
          </Link>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-sm">
      <div className="px-4 h-14 flex items-center justify-between">
        <Link href="/">
          <span
            className="font-semibold text-xl tracking-tight"
            style={{ color: 'var(--gold)', fontFamily: 'var(--font-serif)' }}
          >
            어제의 <span className="text-primary">머미</span>
          </span>
        </Link>
        <FeedbackButton />
      </div>
    </header>
  )
}
