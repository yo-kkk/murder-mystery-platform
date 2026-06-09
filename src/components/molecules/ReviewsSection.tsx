'use client'

import { useState } from 'react'
import { Star, MessageSquare, ArrowUpDown, Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, UserRound, Lock } from 'lucide-react'
import { ReviewCard } from './ReviewCard'

interface Review {
  id: string
  rating: number
  comment: string | null
  tags: string[]
  is_best: boolean
  created_at: string
  nickname: string
}

interface MyReview {
  id: string
  rating: number
  comment: string | null
  tags: string[]
  created_at: string
  is_best?: boolean
  nickname?: string
}

interface Props {
  reviews: Review[]
  myReview?: MyReview | null
  isLoggedIn?: boolean
}

type SortKey = 'newest' | 'oldest' | 'rating_high' | 'rating_low'
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: '최신순' },
  { key: 'oldest', label: '오래된순' },
  { key: 'rating_high', label: '높은 평점순' },
  { key: 'rating_low', label: '낮은 평점순' },
]

const PAGE_SIZE = 5

export function ReviewsSection({ reviews, myReview, isLoggedIn = true }: Props) {
  const [sort, setSort] = useState<SortKey>('newest')
  const [sortOpen, setSortOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [showMine, setShowMine] = useState(false)

  const allReviews: Review[] = (() => {
    if (!myReview) return reviews
    const alreadyIncluded = reviews.some(r => r.id === myReview.id)
    if (alreadyIncluded) return reviews
    return [...reviews, {
      id: myReview.id,
      rating: myReview.rating,
      comment: myReview.comment,
      tags: myReview.tags ?? [],
      is_best: myReview.is_best ?? false,
      created_at: myReview.created_at,
      nickname: myReview.nickname ?? '나',
    }]
  })()

  const displayReviews = showMine
    ? allReviews.filter(r => r.id === myReview?.id)
    : allReviews

  const sorted = [...displayReviews].sort((a, b) => {
    if (sort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    if (sort === 'rating_high') return b.rating - a.rating
    if (sort === 'rating_low') return a.rating - b.rating
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }))
  const maxCount = Math.max(...ratingDist.map(d => d.count), 1)

  return (
    <section>
      <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
        <MessageSquare size={14} /> 플레이어 리뷰
        {reviews.length > 0 && (
          <span className="text-xs font-normal text-muted-foreground/60">{reviews.length}개</span>
        )}
      </h2>

      {!isLoggedIn ? (
        <div className="relative rounded-xl border border-[var(--border)] overflow-hidden">
          {/* 블러 미리보기 */}
          <div className="p-4 space-y-3 blur-sm pointer-events-none select-none">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-2">
                <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} size={13} className="fill-[var(--gold)] text-[var(--gold)]" />)}</div>
                <div className="h-2.5 rounded bg-muted-foreground/20 w-3/4" />
                <div className="h-2.5 rounded bg-muted-foreground/10 w-1/2" />
              </div>
            ))}
          </div>
          {/* 잠금 오버레이 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--background)]/70 backdrop-blur-[2px]">
            <div className="w-10 h-10 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center">
              <Lock size={18} className="text-muted-foreground" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-foreground">로그인 후 리뷰를 확인할 수 있어요</p>
              <p className="text-xs text-muted-foreground">다른 플레이어의 평가를 확인해보세요</p>
            </div>
            <a
              href="/login"
              className="px-5 py-2 rounded-lg text-sm font-semibold"
              style={{ backgroundColor: '#FEE500', color: '#191919' }}
            >
              로그인 후 이용하기
            </a>
          </div>
        </div>
      ) : reviews.length === 0 && !myReview ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center">
          <p className="text-sm text-muted-foreground">아직 작성된 리뷰가 없어요</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 별점 분포 */}
          {reviews.length >= 3 && !showMine && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-2">
              {ratingDist.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-3 text-right">{star}</span>
                  <Star size={10} className="fill-[var(--gold)] text-[var(--gold)] shrink-0" />
                  <div className="flex-1 h-1.5 rounded-full bg-[var(--background)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--gold)]"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-4 text-right text-muted-foreground/60">{count}</span>
                </div>
              ))}
            </div>
          )}

          {/* 컨트롤 */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {showMine ? '내 리뷰' : `${sorted.length}개의 리뷰`}
            </p>
            <div className="flex items-center gap-2">
              {/* 내 리뷰 버튼 */}
              {myReview && (
                <button
                  onClick={() => { setShowMine(p => !p); setPage(1) }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                    showMine
                      ? 'border-primary/60 text-primary bg-primary/5'
                      : 'border-[var(--border)] bg-[var(--card)] text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <UserRound size={11} />
                  내 리뷰
                </button>
              )}

              {/* 정렬 */}
              {!showMine && (
                <div className="relative">
                  <button
                    onClick={() => setSortOpen(p => !p)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                      sort !== 'newest'
                        ? 'border-primary/60 text-primary bg-primary/5'
                        : 'border-[var(--border)] bg-[var(--card)] text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <ArrowUpDown size={11} />
                    {SORT_OPTIONS.find(o => o.key === sort)?.label}
                  </button>
                  {sortOpen && (
                    <div className="absolute right-0 top-full mt-1 z-10 min-w-[120px] rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg overflow-hidden">
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.key}
                          onClick={() => { setSort(opt.key); setSortOpen(false); setPage(1) }}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-[var(--background)] transition-colors"
                        >
                          <span className={sort === opt.key ? 'text-primary font-medium' : 'text-foreground'}>
                            {opt.label}
                          </span>
                          {sort === opt.key && <Check size={11} className="text-primary ml-2" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {paginated.map(review => (
              <ReviewCard
                key={review.id}
                nickname={review.id === myReview?.id ? (myReview.nickname ?? '나') : review.nickname}
                rating={review.rating}
                comment={review.comment}
                tags={review.tags ?? []}
                createdAt={review.created_at}
                isBest={review.is_best}
                isMyReview={review.id === myReview?.id}
              />
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1">
              <button onClick={() => setPage(1)} disabled={page === 1} className="p-1 rounded border border-[var(--border)] text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
                <ChevronsLeft size={13} />
              </button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded border border-[var(--border)] text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
                <ChevronLeft size={13} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-6 h-6 rounded text-xs transition-colors ${p === page ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 rounded border border-[var(--border)] text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
                <ChevronRight size={13} />
              </button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-1 rounded border border-[var(--border)] text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
                <ChevronsRight size={13} />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
