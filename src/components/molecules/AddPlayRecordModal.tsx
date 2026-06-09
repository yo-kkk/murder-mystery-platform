'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { X, CalendarIcon, MapPin, Users, FileText, Plus, ImagePlus } from 'lucide-react'
import { addPlayRecord, updatePlayRecord, deletePlayRecord } from '@/app/actions/play-records'
import { StarPicker } from '@/components/atoms/StarPicker'
import { createClient } from '@/lib/supabase/browser'
import type { Game } from '@/types'

interface PlayRecord {
  id: string
  played_at: string
  venue_name: string | null
  companions: string[]
  memo: string | null
  image_urls: string[]
  is_best: boolean
}

interface ExistingReview {
  id: string
  rating: number
  comment: string | null
  tags: string[]
  is_public: boolean
  is_best: boolean
  nickname?: string
}

const REVIEW_TAGS = [
  { emoji: '🎭', label: '흥미진진해요' },
  { emoji: '✨', label: '구성이 신박해요' },
  { emoji: '📖', label: '스토리가 좋아요' },
  { emoji: '😊', label: '난이도가 쉬워요' },
  { emoji: '🔍', label: '조금 어려운 추리에요' },
]
const PRESET_TAG_LABELS = REVIEW_TAGS.map(t => t.label)

interface Props {
  game: Game
  onClose: () => void
  existingRecord?: PlayRecord
  existingReview?: ExistingReview | null
  focusReview?: boolean
}

export function AddPlayRecordModal({ game, onClose, existingRecord, existingReview, focusReview }: Props) {
  const isEditMode = !!existingRecord
  const [isPending, startTransition] = useTransition()

  // 기록
  const [isBest, setIsBest] = useState(existingRecord?.is_best ?? false)
  const [isReviewBest, setIsReviewBest] = useState(existingReview?.is_best ?? false)
  const [playedAt, setPlayedAt] = useState(
    existingRecord ? existingRecord.played_at : new Date().toISOString().split('T')[0]
  )
  const [venue, setVenue] = useState(existingRecord?.venue_name ?? '')
  const [companionInput, setCompanionInput] = useState('')
  const [companions, setCompanions] = useState<string[]>(existingRecord?.companions ?? [])
  const [memo, setMemo] = useState(existingRecord?.memo ?? '')
  const [images, setImages] = useState<{ file: File; preview: string }[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const reviewSectionRef = useRef<HTMLDivElement>(null)

  // 리뷰
  const [rating, setRating] = useState(existingReview?.rating ?? 3)
  const [comment, setComment] = useState(existingReview?.comment ?? '')
  const [isPublicReview, setIsPublicReview] = useState(existingReview?.is_public ?? true)
  const [skipReview, setSkipReview] = useState(focusReview ? false : (isEditMode && !existingReview))

  useEffect(() => {
    if (focusReview && reviewSectionRef.current) {
      setTimeout(() => {
        reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }, [])
  const [selectedTags, setSelectedTags] = useState<string[]>(
    existingReview?.tags?.filter(t => PRESET_TAG_LABELS.includes(t)) ?? []
  )
  const [customTags, setCustomTags] = useState<string[]>(
    existingReview?.tags?.filter(t => !PRESET_TAG_LABELS.includes(t)) ?? []
  )
  const [tagInput, setTagInput] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)

  function toggleTag(label: string) {
    setSelectedTags(prev =>
      prev.includes(label) ? prev.filter(t => t !== label) : [...prev, label]
    )
  }

  function addCustomTag() {
    const tag = tagInput.trim()
    if (!tag || customTags.includes(tag) || REVIEW_TAGS.some(t => t.label === tag)) return
    setCustomTags(prev => [...prev, tag])
    setSelectedTags(prev => [...prev, tag])
    setTagInput('')
    setShowTagInput(false)
  }

  function removeCustomTag(tag: string) {
    setCustomTags(prev => prev.filter(t => t !== tag))
    setSelectedTags(prev => prev.filter(t => t !== tag))
  }

  function handleTagInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); addCustomTag() }
    if (e.key === 'Escape') { setShowTagInput(false); setTagInput('') }
  }

  const [error, setError] = useState('')

  function addCompanion() {
    const name = companionInput.trim()
    if (!name || companions.includes(name)) return
    setCompanions(prev => [...prev, name])
    setCompanionInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCompanion()
    }
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const remaining = 3 - images.length
    files.slice(0, remaining).forEach(file => {
      const preview = URL.createObjectURL(file)
      setImages(prev => [...prev, { file, preview }])
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
        .from('play-record-images')
        .upload(path, file, { upsert: false })
      if (!error) {
        const { data } = supabase.storage.from('play-record-images').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    return urls
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!memo.trim()) return
    if (!skipReview && !comment.trim()) return
    setError('')
    startTransition(async () => {
      setUploadingImages(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const newImageUrls = user ? await uploadImages(user.id) : []
      const imageUrls = isEditMode
        ? [...(existingRecord.image_urls ?? []), ...newImageUrls]
        : newImageUrls
      setUploadingImages(false)

      const result = isEditMode
        ? await updatePlayRecord(existingRecord.id, {
            playedAt,
            venueName: venue || undefined,
            companions,
            memo,
            imageUrls,
            isBest,
            gameId: game.id,
            skipReview,
            rating: skipReview ? undefined : rating,
            comment: skipReview ? undefined : (comment || undefined),
            tags: skipReview ? undefined : selectedTags,
            isPublicReview: skipReview ? false : isPublicReview,
            isReviewBest: skipReview ? false : isReviewBest,
          })
        : await addPlayRecord({
            gameId: game.id,
            playedAt,
            venueName: venue || undefined,
            companions,
            memo,
            imageUrls,
            isBest,
            skipReview,
            rating: skipReview ? undefined : rating,
            comment: skipReview ? undefined : (comment || undefined),
            tags: skipReview ? undefined : selectedTags,
            isPublicReview: skipReview ? false : isPublicReview,
            isReviewBest: skipReview ? false : isReviewBest,
          })

      if (result.error) {
        setError(result.error)
        return
      }
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div style={{ scrollbarWidth: 'none' }} className="relative w-full sm:max-w-md bg-[var(--card)] border border-[var(--border)] rounded-t-2xl sm:rounded-2xl p-5 space-y-5 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
        {/* Header */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{isEditMode ? '기록 수정' : '기록 작성'}</p>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
              <X size={18} />
            </button>
          </div>
          <h2 className="font-bold text-foreground line-clamp-2">{game.title}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── 기록 섹션 ── */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 space-y-4">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-foreground">나의 게임 기록</p>
              <button
                type="button"
                onClick={() => setIsBest(p => !p)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  isBest
                    ? 'bg-yellow-400/15 border-yellow-400/60 text-yellow-400'
                    : 'border-white/30 text-muted-foreground hover:border-yellow-400/40 hover:text-yellow-400/70'
                }`}
              >
                👑 내 인생 머미
              </button>
            </div>

            {/* 날짜 */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <CalendarIcon size={11} /> 플레이 날짜
              </label>
              <input
                type="date"
                value={playedAt}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setPlayedAt(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)] text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>

            {/* 장소 */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <MapPin size={11} /> 장소 <span className="opacity-50">(선택)</span>
              </label>
              <input
                type="text"
                value={venue}
                onChange={e => setVenue(e.target.value)}
                placeholder="예: 홍대 파티룸, 집 등"
                className="w-full px-3 py-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)] text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>

            {/* 동행 */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Users size={11} /> 동행 <span className="opacity-50">(선택)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={companionInput}
                  onChange={e => setCompanionInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="이름 입력 후 Enter"
                  className="flex-1 px-3 py-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)] text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={addCompanion}
                  className="px-3 py-2.5 rounded-lg border border-[var(--border)] text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                >
                  <Plus size={15} />
                </button>
              </div>
              {companions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {companions.map(name => (
                    <span
                      key={name}
                      onClick={() => setCompanions(p => p.filter(c => c !== name))}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs cursor-pointer hover:bg-primary/25 transition-colors"
                    >
                      {name} <X size={10} />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 메모 */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <FileText size={11} /> 메모
              </label>
              <textarea
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="플레이 소감, 기억하고 싶은 것들..."
                rows={2}
                className={`w-full px-3 py-2.5 rounded-lg bg-[var(--background)] border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none transition-colors resize-none ${
                  !memo.trim()
                    ? 'border-red-400 focus:border-red-400'
                    : 'border-[var(--border)] focus:border-primary/60'
                }`}
              />
            </div>

            {/* 사진 */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <ImagePlus size={11} /> 사진 <span className="opacity-50">(선택 · 최대 3장)</span>
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
          </div>

          {/* ── 리뷰 섹션 ── */}
          <div ref={reviewSectionRef} className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-foreground">게임 리뷰</p>
              <button
                type="button"
                onClick={() => setSkipReview(p => !p)}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                  skipReview
                    ? 'bg-muted-foreground/20 text-muted-foreground'
                    : 'bg-muted-foreground/10 text-muted-foreground hover:bg-muted-foreground/20'
                }`}
              >
                {skipReview ? '리뷰 작성하기' : existingReview ? '리뷰 삭제하기' : '리뷰하지 않기'}
              </button>
            </div>

            {!skipReview && <>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">내 리뷰 공개하기</span>
                <button
                  type="button"
                  onClick={() => setIsPublicReview(p => !p)}
                  className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${
                    isPublicReview ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    isPublicReview ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

            {/* 별점 */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                평점
              </label>
              <StarPicker value={rating} onChange={v => { setRating(v); if (v < 5) setIsReviewBest(false) }} />
            </div>

            {/* 태그 */}
            <div className="pt-1">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={rating < 5}
                  onClick={() => setIsReviewBest(p => !p)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    isReviewBest
                      ? 'bg-yellow-400/15 border-yellow-400/60 text-yellow-400'
                      : rating < 5
                        ? 'bg-[var(--background)] text-muted-foreground/30 border-[var(--border)] cursor-not-allowed'
                        : 'bg-[var(--background)] text-muted-foreground border-[var(--border)] hover:border-yellow-400/40 hover:text-yellow-400/70'
                  }`}
                >
                  <span>👑</span>
                  <span>인생 머미</span>
                </button>
                {REVIEW_TAGS.map(({ emoji, label }) => {
                  const active = selectedTags.includes(label)
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleTag(label)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        active
                          ? 'bg-primary text-white border-primary'
                          : 'bg-[var(--background)] text-muted-foreground border-[var(--border)] hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      <span>{emoji}</span>
                      <span>{label}</span>
                    </button>
                  )
                })}

                {/* 커스텀 태그 */}
                {customTags.map(tag => (
                  <div
                    key={tag}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-[var(--background)] text-muted-foreground border-[var(--border)]'
                    }`}
                  >
                    <button type="button" onClick={() => toggleTag(tag)}>{tag}</button>
                    <button
                      type="button"
                      onClick={() => removeCustomTag(tag)}
                      className="ml-0.5 opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}

                {/* + 추가 버튼 / 인풋 */}
                {showTagInput ? (
                  <input
                    autoFocus
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    onBlur={addCustomTag}
                    placeholder="태그 입력"
                    maxLength={20}
                    className="px-3 py-1.5 rounded-full text-xs border border-primary/60 bg-[var(--background)] text-foreground focus:outline-none w-24"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowTagInput(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-[var(--border)] text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
                  >
                    <Plus size={11} /> 추가
                  </button>
                )}
              </div>
            </div>

            {/* 한줄평 */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                한줄평
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="이 게임을 한 줄로 표현한다면?"
                maxLength={100}
                rows={2}
                className={`w-full px-3 py-2.5 rounded-lg bg-[var(--background)] border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none transition-colors resize-none ${
                  !comment.trim()
                    ? 'border-red-400 focus:border-red-400'
                    : 'border-[var(--border)] focus:border-primary/60'
                }`}
              />
            </div>
            </>}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isPending || uploadingImages}
            className="w-full py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {uploadingImages ? '사진 업로드 중...' : isPending ? '저장 중...' : isEditMode ? '수정 완료' : '저장'}
          </button>

          {isEditMode && (
            <button
              type="button"
              disabled={isPending}
              onClick={async () => {
                if (!confirm('기록을 삭제할까요? 이 작업은 되돌릴 수 없어요.')) return
                await deletePlayRecord(existingRecord!.id)
                onClose()
              }}
              className="w-full py-2.5 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              삭제하기
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
