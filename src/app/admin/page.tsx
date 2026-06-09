import { createClient } from '@/lib/supabase/server'
import { AdminSubmissions } from './AdminSubmissions'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: submissions } = await supabase
    .from('game_submissions')
    .select('*')
    .order('submitted_at', { ascending: false })

  return <AdminSubmissions submissions={submissions ?? []} />
}
