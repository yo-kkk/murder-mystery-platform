'use client'

import { useState, useTransition } from 'react'
import { MessageSquare, CheckCircle, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { resolveFeedback } from '@/app/actions/feedback'

type Filter = 'pending' | 'resolved' | 'all'

interface Feedback {
  id: string
  nickname: string | null
  content: string
  page_url: string | null
  created_at: string
  resolved: boolean
  resolved_at: string | null
}

export function AdminFeedbackClient({ feedbacks: initial }: { feedbacks: Feedback[] }) {
  const [filter, setFilter] = useState<Filter>('pending')
  const [feedbacks, setFeedbacks] = useState(initial)
  const [pending, startTransition] = useTransition()

  const filtered = feedbacks.filter(fb => {
    if (filter === 'pending') return !fb.resolved
    if (filter === 'resolved') return fb.resolved
    return true
  })

  const counts = {
    all: feedbacks.length,
    pending: feedbacks.filter(f => !f.resolved).length,
    resolved: feedbacks.filter(f => f.resolved).length,
  }

  function handleResolve(id: string) {
    startTransition(async () => {
      const res = await resolveFeedback(id)
      if (res.success) {
        setFeedbacks(prev =>
          prev.map(f => f.id === id ? { ...f, resolved: true, resolved_at: new Date().toISOString() } : f)
        )
      }
    })
  }

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'pending', label: `미처리 ${counts.pending}` },
    { key: 'resolved', label: `처리완료 ${counts.resolved}` },
    { key: 'all', label: `전체 ${counts.all}` },
  ]

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-1.5">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === key
                ? 'bg-primary/15 border border-primary/50 text-primary'
                : 'border border-[var(--border)] text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {filter === 'pending' ? '미처리 의견이 없어요 🎉' : '항목이 없어요'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((fb) => (
            <div
              key={fb.id}
              className={`rounded-xl border bg-[var(--card)] p-4 space-y-3 ${
                fb.resolved ? 'border-[var(--border)] opacity-60' : 'border-[var(--border)]'
              }`}
            >
              {/* Meta row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <MessageSquare size={11} className="text-muted-foreground shrink-0" />
                  <span className="text-xs font-semibold text-foreground">
                    {fb.nickname ?? '익명'}
                  </span>
                  {fb.page_url && (
                    <>
                      <span className="text-muted-foreground/40 text-xs">·</span>
                      <span className="text-[11px] text-muted-foreground">{fb.page_url}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {fb.resolved ? (
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/40 text-green-400">
                      <CheckCircle size={9} /> 처리완료
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400">
                      <Clock size={9} /> 미처리
                    </span>
                  )}
                  <span className="text-[11px] text-muted-foreground">
                    {formatDate(fb.created_at)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{fb.content}</p>

              {/* Resolve button */}
              {!fb.resolved && (
                <div className="flex justify-end">
                  <button
                    onClick={() => handleResolve(fb.id)}
                    disabled={pending}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-green-500/50 text-green-400 hover:bg-green-500/10 transition-colors disabled:opacity-40"
                  >
                    <CheckCircle size={11} />
                    처리 완료
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
