import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSubmissions } from './AdminSubmissions'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/')

  const { data: submissions } = await supabase
    .from('game_submissions')
    .select('*')
    .order('submitted_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-foreground">어드민</h1>
        <p className="text-sm text-muted-foreground">게임 제출 검수</p>
      </div>
      <AdminSubmissions submissions={submissions ?? []} />
    </div>
  )
}
