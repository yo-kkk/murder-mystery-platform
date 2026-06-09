'use client'

import Link from 'next/link'

export function LoginRequiredOverlay() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="space-y-2">
        <h2
          className="text-2xl font-bold"
          style={{ color: 'var(--gold)', fontFamily: 'var(--font-serif)' }}
        >
          어제의 <span className="text-primary">머미</span>
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          로그인 후 이용할 수 있어요
        </p>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <Link
          href="/login"
          className="block w-full py-3.5 rounded-xl font-semibold text-sm text-center bg-[var(--gold)] text-black hover:opacity-90 transition-opacity"
        >
          로그인 하기
        </Link>
        <Link
          href="/games"
          className="block w-full py-3 rounded-xl font-medium text-sm text-center border border-[var(--border)] bg-[var(--card)] text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
        >
          더 둘러보기
        </Link>
      </div>
    </div>
  )
}
