import { createClient } from '@/lib/supabase/server'
import { AdminFeedbackClient } from './AdminFeedbackClient'

export const dynamic = 'force-dynamic'

export default async function AdminFeedbackPage() {
  const supabase = await createClient()

  const { data: feedbacks } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })

  return <AdminFeedbackClient feedbacks={feedbacks ?? []} />
}
