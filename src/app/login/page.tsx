'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  async function handleKakaoLogin() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        scopes: 'profile_nickname profile_image',
      },
    })
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-20">
      <div className="w-full max-w-sm space-y-10">
        {/* Title */}
        <div className="text-center space-y-3">
          <h1
            className="text-4xl font-bold"
            style={{ color: 'var(--gold)', fontFamily: 'var(--font-serif)' }}
          >
            어제의 <span className="text-primary">머미</span>
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            플레이한 게임을 기록하고,<br />새로운 사건을 찾아보세요
          </p>
        </div>

        {/* Kakao Login Button */}
        <div className="space-y-3">
          <button
            onClick={handleKakaoLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-60"
            style={{ backgroundColor: '#FEE500', color: '#191919' }}
          >
            <KakaoIcon />
            {loading ? '카카오 로그인 중...' : '카카오로 시작하기'}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            현재는 카카오 로그인만 이용 가능합니다
          </p>
        </div>
      </div>
    </div>
  )
}

function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 1.5C4.858 1.5 1.5 4.134 1.5 7.38c0 2.088 1.374 3.924 3.444 4.968l-.876 3.27a.225.225 0 0 0 .342.243l3.822-2.52A9.014 9.014 0 0 0 9 13.26c4.142 0 7.5-2.634 7.5-5.88C16.5 4.134 13.142 1.5 9 1.5Z"
        fill="#191919"
      />
    </svg>
  )
}
