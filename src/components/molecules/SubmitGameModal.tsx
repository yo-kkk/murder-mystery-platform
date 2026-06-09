'use client'

import { useState, useTransition } from 'react'
import { X, Plus } from 'lucide-react'
import { submitGame } from '@/app/actions/game-submissions'

const THEME_OPTIONS = [
  { value: 'victorian', label: '빅토리안' },
  { value: 'modern', label: '현대' },
  { value: 'fantasy', label: '판타지' },
  { value: 'horror', label: '호러' },
  { value: 'comedy', label: '코미디' },
  { value: 'historical', label: '역사' },
  { value: 'scifi', label: 'SF' },
]

interface Props {
  onClose: () => void
}

export function SubmitGameModal({ onClose }: Props) {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [themes, setThemes] = useState<string[]>([])
  const [minPlayers, setMinPlayers] = useState(2)
  const [maxPlayers, setMaxPlayers] = useState(6)
  const [duration, setDuration] = useState(60)
  const [maxDuration, setMaxDuration] = useState('')
  const [requiresGm, setRequiresGm] = useState(false)
  const [publisher, setPublisher] = useState('')
  const [releaseYear, setReleaseYear] = useState('')

  function toggleTheme(v: string) {
    setThemes(p => p.includes(v) ? p.filter(t => t !== v) : [...p, v])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return
    setError('')
    startTransition(async () => {
      const result = await submitGame({
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        description: description.trim(),
        themes,
        minPlayers,
        maxPlayers,
        durationMinutes: duration,
        maxDurationMinutes: maxDuration ? Number(maxDuration) : undefined,
        requiresGm,
        publisher: publisher.trim() || undefined,
        releaseYear: releaseYear ? Number(releaseYear) : undefined,
      })
      if (result.error) { setError(result.error); return }
      setDone(true)
    })
  }

  const inputClass = 'w-full px-3 py-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)] text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/60 transition-colors'

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div style={{ scrollbarWidth: 'none' }} className="relative w-full sm:max-w-md bg-[var(--card)] border border-[var(--border)] rounded-t-2xl sm:rounded-2xl p-5 space-y-5 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">게임 정보를 입력해주세요</p>
            <h2 className="font-bold text-foreground">새로운 머미 추가</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {done ? (
          <div className="py-8 text-center space-y-3">
            <p className="text-2xl">🎉</p>
            <p className="font-semibold text-foreground">제출 완료!</p>
            <p className="text-sm text-muted-foreground">검수 후 등록될 예정이에요.<br />감사합니다!</p>
            <button onClick={onClose} className="mt-2 px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium">
              닫기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">제목 *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="게임 제목" className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">부제목 <span className="opacity-50">(선택)</span></label>
                <input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="부제목" className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">게임 설명 *</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="스토리, 배경, 특징 등" rows={3} className={`${inputClass} resize-none`} />
              </div>
            </div>

            {/* 테마 */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">테마 <span className="opacity-50">(복수 선택)</span></label>
              <div className="flex flex-wrap gap-1.5">
                {THEME_OPTIONS.map(({ value, label }) => (
                  <button key={value} type="button" onClick={() => toggleTheme(value)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${themes.includes(value) ? 'border-primary text-primary bg-primary/10' : 'border-[var(--border)] text-muted-foreground hover:border-primary/40'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 인원 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">최소 인원 *</label>
                <input type="number" min={1} max={20} value={minPlayers} onChange={e => setMinPlayers(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">최대 인원 *</label>
                <input type="number" min={1} max={20} value={maxPlayers} onChange={e => setMaxPlayers(Number(e.target.value))} className={inputClass} />
              </div>
            </div>

            {/* 시간 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">소요 시간(분) *</label>
                <input type="number" min={10} value={duration} onChange={e => setDuration(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">최대 시간(분) <span className="opacity-50">(선택)</span></label>
                <input type="number" min={10} value={maxDuration} onChange={e => setMaxDuration(e.target.value)} placeholder="-" className={inputClass} />
              </div>
            </div>

            {/* 기타 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">제작사 <span className="opacity-50">(선택)</span></label>
                <input value={publisher} onChange={e => setPublisher(e.target.value)} placeholder="제작사명" className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">출시연도 <span className="opacity-50">(선택)</span></label>
                <input type="number" min={2000} max={2030} value={releaseYear} onChange={e => setReleaseYear(e.target.value)} placeholder="2024" className={inputClass} />
              </div>
            </div>

            {/* GM 필수 */}
            <div
              className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] cursor-pointer"
              onClick={() => setRequiresGm(p => !p)}
            >
              <p className="text-sm text-foreground">GM 필수</p>
              <div className={`w-9 h-5 rounded-full transition-colors relative ${requiresGm ? 'bg-primary' : 'bg-[var(--border)]'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${requiresGm ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button type="submit" disabled={isPending || !title.trim() || !description.trim()}
              className="w-full py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isPending ? '제출 중...' : '검수 요청하기'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
