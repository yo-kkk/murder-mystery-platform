'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { MessageSquarePlus, X, Send, Loader2 } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { submitFeedback } from '@/app/actions/feedback'

type Status = 'idle' | 'loading' | 'done' | 'error'

export function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 50)
    } else {
      setContent('')
      setStatus('idle')
      setErrorMsg('')
    }
  }, [open])

  async function handleSubmit() {
    if (!content.trim() || status === 'loading') return
    setStatus('loading')
    setErrorMsg('')

    const result = await submitFeedback(content, pathname)

    if (result.error) {
      setErrorMsg(result.error)
      setStatus('error')
    } else {
      setStatus('done')
      setTimeout(() => setOpen(false), 1500)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') setOpen(false)
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit()
  }

  const modal = open ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-foreground">의견 제시</p>
                <p className="text-xs text-muted-foreground">불편한 점이나 개선 아이디어를 알려주세요</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {status === 'done' ? (
              <div className="py-6 text-center space-y-2">
                <div className="text-2xl">🙏</div>
                <p className="text-sm font-medium text-foreground">소중한 의견 감사해요!</p>
                <p className="text-xs text-muted-foreground">더 나은 서비스를 만드는 데 반영할게요.</p>
              </div>
            ) : (
              <>
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="자유롭게 적어주세요..."
                  rows={5}
                  className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors leading-relaxed"
                />
                {errorMsg && (
                  <p className="text-xs text-destructive">{errorMsg}</p>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground/60">⌘ + Enter로 제출</p>
                  <button
                    onClick={handleSubmit}
                    disabled={!content.trim() || status === 'loading'}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Send size={13} />
                    )}
                    제출
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
  ) : null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
        title="의견 제시"
      >
        <MessageSquarePlus size={13} />
        <span>의견</span>
      </button>
      {typeof document !== 'undefined' && modal
        ? createPortal(modal, document.body)
        : null}
    </>
  )
}
