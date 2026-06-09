'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

export default function OnboardingPage() {
  const [nickname, setNickname] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = nickname.trim()
    if (!trimmed) {
      setError('닉네임을 입력해주세요')
      return
    }
    if (trimmed.length < 2 || trimmed.length > 12) {
      setError('닉네임은 2~12자로 입력해주세요')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ nickname: trimmed, is_nickname_public: isPublic })
      .eq('id', user.id)

    if (updateError) {
      setError('저장 중 오류가 발생했어요. 다시 시도해주세요.')
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-20">
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center space-y-3">
          <h1
            className="text-3xl font-bold"
            style={{ color: 'var(--gold)', fontFamily: 'var(--font-serif)' }}
          >
            어제의 <span className="text-primary">머미</span>
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            닉네임을 설정하고 시작해보세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={e => { setNickname(e.target.value); setError('') }}
              placeholder="2~12자로 입력해주세요"
              maxLength={12}
              className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>

          <div
            className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] cursor-pointer"
            onClick={() => setIsPublic(p => !p)}
          >
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">닉네임 공개</p>
              <p className="text-xs text-muted-foreground">
                {isPublic ? '다른 사람에게 닉네임이 표시돼요' : '리뷰에 (비공개 유저)로 표시돼요'}
              </p>
            </div>
            <div className={`w-11 h-6 rounded-full transition-colors relative ${isPublic ? 'bg-primary' : 'bg-[var(--border)]'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !nickname.trim()}
            className="w-full py-3.5 rounded-xl font-semibold text-sm bg-[var(--gold)] text-black hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {loading ? '저장 중...' : '시작하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
