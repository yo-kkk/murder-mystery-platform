import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { AdminNav } from './AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/')

  return (
    <div className="space-y-0">
      {/* Admin banner */}
      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert size={15} className="text-amber-400 shrink-0" />
          <span className="text-xs font-semibold text-amber-400">어드민 모드</span>
        </div>
        <Link
          href="/"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={12} />
          일반 페이지
        </Link>
      </div>

      {/* Tab nav */}
      <div className="pt-3">
        <AdminNav />
      </div>

      {/* Page content */}
      <div className="pt-4">
        {children}
      </div>
    </div>
  )
}
