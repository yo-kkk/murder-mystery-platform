import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { MessageSquare } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminFeedbackPage() {
  const supabase = await createClient()

  const { data: feedbacks } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">총 {feedbacks?.length ?? 0}건</p>
      </div>

      {!feedbacks?.length ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center">
          <p className="text-sm text-muted-foreground">아직 제출된 의견이 없어요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MessageSquare size={11} />
                  <span className="font-medium text-foreground">{fb.nickname ?? '익명'}</span>
                  <span>·</span>
                  <span>{fb.page_url}</span>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {formatDate(fb.created_at)}
                </span>
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{fb.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
