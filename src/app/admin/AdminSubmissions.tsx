'use client'

import { useState, useTransition } from 'react'
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import { approveSubmission, rejectSubmission } from '@/app/actions/game-submissions'

interface Submission {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  image_urls: string[]
  min_players: number
  max_players: number
  duration_minutes: number
  max_duration_minutes: number | null
  requires_gm: boolean
  publisher: string | null
  release_year: number | null
  status: string
  reviewer_note: string | null
  submitted_at: string
}

const STATUS_LABEL: Record<string, string> = {
  pending: '검수 대기',
  approved: '승인됨',
  rejected: '거절됨',
}
const STATUS_COLOR: Record<string, string> = {
  pending: 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10',
  approved: 'text-green-400 border-green-400/40 bg-green-400/10',
  rejected: 'text-red-400 border-red-400/40 bg-red-400/10',
}

export function AdminSubmissions({ submissions }: { submissions: Submission[] }) {
  const pending = submissions.filter(s => s.status === 'pending')
  const rest = submissions.filter(s => s.status !== 'pending')

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">대기 중 <span className="text-primary">{pending.length}</span></p>
      </div>

      {submissions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">제출된 게임이 없어요</p>
      ) : (
        <div className="space-y-3">
          {[...pending, ...rest].map(sub => (
            <SubmissionCard key={sub.id} submission={sub} />
          ))}
        </div>
      )}
    </div>
  )
}

function SubmissionCard({ submission: s }: { submission: Submission }) {
  const [expanded, setExpanded] = useState(s.status === 'pending')
  const [rejectNote, setRejectNote] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleApprove() {
    startTransition(async () => {
      await approveSubmission(s.id)
    })
  }

  function handleReject() {
    if (!showRejectInput) { setShowRejectInput(true); return }
    startTransition(async () => {
      await rejectSubmission(s.id, rejectNote || undefined)
      setShowRejectInput(false)
    })
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      <div
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(p => !p)}
      >
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${STATUS_COLOR[s.status]}`}>
              {STATUS_LABEL[s.status]}
            </span>
            <h3 className="font-semibold text-foreground text-sm truncate">{s.title}</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(s.submitted_at).toLocaleDateString('ko-KR')} · {s.min_players}~{s.max_players}인 · {s.duration_minutes}분
          </p>
        </div>
        {expanded ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-[var(--border)] pt-4">
          {s.subtitle && <p className="text-sm text-muted-foreground">{s.subtitle}</p>}
          {s.image_urls?.length > 0 && (
            <div className="flex gap-2">
              {s.image_urls.map((url, i) => (
                <img key={i} src={url} alt="" className="w-20 h-20 rounded-lg object-cover border border-[var(--border)]" />
              ))}
            </div>
          )}
          {s.description && <p className="text-sm text-foreground leading-relaxed">{s.description}</p>}

          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            {s.publisher && <div><span className="text-foreground/50">제작사</span> {s.publisher}</div>}
            {s.release_year && <div><span className="text-foreground/50">출시연도</span> {s.release_year}</div>}
            {s.max_duration_minutes && <div><span className="text-foreground/50">최대 시간</span> {s.max_duration_minutes}분</div>}
            <div><span className="text-foreground/50">GM 필수</span> {s.requires_gm ? '예' : '아니오'}</div>
          </div>

          {s.reviewer_note && (
            <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{s.reviewer_note}</p>
          )}

          {s.status === 'pending' && (
            <div className="space-y-2">
              {showRejectInput && (
                <input
                  autoFocus
                  value={rejectNote}
                  onChange={e => setRejectNote(e.target.value)}
                  placeholder="거절 사유 (선택)"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-red-400/60"
                />
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleApprove}
                  disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-green-500/20 border border-green-500/40 text-green-400 text-sm font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50"
                >
                  <Check size={14} /> 승인
                </button>
                <button
                  onClick={handleReject}
                  disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  <X size={14} /> {showRejectInput ? '거절 확정' : '거절'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
