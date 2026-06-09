'use client'

import { useState, useTransition, useRef } from 'react'
import { X, ImagePlus } from 'lucide-react'
import { submitGame } from '@/app/actions/game-submissions'
import { createClient } from '@/lib/supabase/browser'

interface Props {
  onClose: () => void
}

export function SubmitGameModal({ onClose }: Props) {
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState<'form' | 'confirm' | 'done'>('form')
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [minPlayers, setMinPlayers] = useState(2)
  const [maxPlayers, setMaxPlayers] = useState(6)
  const [duration, setDuration] = useState(60)
  const [maxDuration, setMaxDuration] = useState('')
  const [requiresGm, setRequiresGm] = useState(false)
  const [publisher, setPublisher] = useState('')
  const [releaseYear, setReleaseYear] = useState('')
  const [images, setImages] = useState<{ file: File; preview: string }[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const remaining = 3 - images.length
    files.slice(0, remaining).forEach(file => {
      setImages(prev => [...prev, { file, preview: URL.createObjectURL(file) }])
    })
    e.target.value = ''
  }

  function removeImage(index: number) {
    setImages(prev => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  async function uploadImages(userId: string): Promise<string[]> {
    if (images.length === 0) return []
    const supabase = createClient()
    const urls: string[] = []
    for (const { file } of images) {
      const ext = file.name.split('.').pop()
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage
        .from('game-submission-images')
        .upload(path, file, { upsert: false })
      if (!error) {
        const { data } = supabase.storage.from('game-submission-images').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    return urls
  }

  function handleRequestSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setStep('confirm')
  }

  function handleConfirm() {
    setError('')
    startTransition(async () => {
      setUploadingImages(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const imageUrls = user ? await uploadImages(user.id) : []
      setUploadingImages(false)

      const result = await submitGame({
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        description: description.trim() || undefined,
        minPlayers,
        maxPlayers,
        durationMinutes: duration,
        maxDurationMinutes: maxDuration ? Number(maxDuration) : undefined,
        requiresGm,
        publisher: publisher.trim() || undefined,
        releaseYear: releaseYear ? Number(releaseYear) : undefined,
        imageUrls,
      })
      if (result.error) { setError(result.error); setStep('form'); return }
      setStep('done')
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

        {step === 'done' && (
          <div className="py-8 text-center space-y-3">
            <p className="text-2xl">🎉</p>
            <p className="font-semibold text-foreground">제출 완료!</p>
            <p className="text-sm text-muted-foreground">검수 후 등록될 예정이에요.<br />감사합니다!</p>
            <button onClick={onClose} className="mt-2 px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium">
              닫기
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="py-6 space-y-5">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 space-y-2">
              <p className="text-sm font-semibold text-foreground">{title}</p>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
              <p className="text-xs text-muted-foreground">{minPlayers}~{maxPlayers}인 · {duration}분{maxDuration ? `~${maxDuration}분` : ''}{requiresGm ? ' · GM필수' : ''}</p>
              {images.length > 0 && (
                <div className="flex gap-2 pt-1">
                  {images.map(({ preview }, i) => (
                    <img key={i} src={preview} alt="" className="w-12 h-12 rounded-md object-cover border border-[var(--border)]" />
                  ))}
                </div>
              )}
            </div>
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-1">
              <p className="text-sm font-medium text-foreground">검수 후 등록됩니다</p>
              <p className="text-xs text-muted-foreground">입력하신 게임 정보는 관리자 검수를 거친 후 등록돼요. 제출하시겠어요?</p>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => setStep('form')}
                className="flex-1 py-3 rounded-lg border border-[var(--border)] text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                돌아가기
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending || uploadingImages}
                className="flex-1 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {uploadingImages ? '업로드 중...' : isPending ? '제출 중...' : '제출하기'}
              </button>
            </div>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleRequestSubmit} className="space-y-4">
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
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">게임 설명 <span className="opacity-50">(선택)</span></label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="스토리, 배경, 특징 등" rows={3} className={`${inputClass} resize-none`} />
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

            {/* 이미지 */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <ImagePlus size={11} /> 이미지 <span className="opacity-50">(선택 · 최대 3장)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {images.map(({ preview }, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[var(--border)]">
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center"
                    >
                      <X size={9} className="text-white" />
                    </button>
                  </div>
                ))}
                {images.length < 3 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-lg border border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
                  >
                    <ImagePlus size={16} />
                    <span className="text-[10px]">추가</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>

            <button type="submit" disabled={!title.trim()}
              className="w-full py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              검수 요청하기
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
