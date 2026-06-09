import Link from 'next/link'
import { FeedbackButton } from '@/components/molecules/FeedbackButton'

export function Header() {
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
