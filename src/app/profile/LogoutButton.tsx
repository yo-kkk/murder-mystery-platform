'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
    >
      <LogOut size={15} />
      로그아웃
    </button>
  )
}
