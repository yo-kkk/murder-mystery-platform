import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LoginRequiredOverlay } from '@/components/molecules/LoginRequiredOverlay'
import { LogoutButton } from './LogoutButton'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <LoginRequiredOverlay />

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, is_nickname_public, is_admin')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-foreground">프로필</h1>
        <p className="text-sm text-muted-foreground">계정 정보를 확인하세요</p>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">닉네임</span>
            <span className="text-sm text-foreground font-medium">
              {profile?.nickname ?? '미설정'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">닉네임 공개</span>
            <span className="text-sm text-foreground">
              {profile?.is_nickname_public ? '공개' : '비공개'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">이메일</span>
            <span className="text-sm text-foreground">{user.email ?? '-'}</span>
          </div>
        </div>
      </div>

      {profile?.is_admin && (
        <Link
          href="/admin"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-primary/40 text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
        >
          어드민 페이지
        </Link>
      )}

      <LogoutButton />
    </div>
  )
}
