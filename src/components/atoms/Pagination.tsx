'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface Props {
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  showFirstLast?: boolean
  groupSize?: number
  pageSize?: number
  pageSizeOptions?: number[]
  onPageSizeChange?: (size: number) => void
}

const btnClass = 'p-1 rounded border border-[var(--border)] text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors'

export function Pagination({
  page,
  totalPages,
  onPageChange,
  showFirstLast = true,
  groupSize = 5,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
}: Props) {
  const hasPageSize = pageSize !== undefined && pageSizeOptions && onPageSizeChange

  const pages = groupSize === 0
    ? Array.from({ length: totalPages }, (_, i) => i + 1)
    : (() => {
        const start = Math.floor((page - 1) / groupSize) * groupSize + 1
        const end = Math.min(start + groupSize - 1, totalPages)
        return Array.from({ length: end - start + 1 }, (_, i) => start + i)
      })()

  return (
    <div className="relative flex items-center justify-center">
      {hasPageSize && (
        <div className="absolute right-0">
          <select
            value={pageSize}
            onChange={e => onPageSizeChange!(Number(e.target.value))}
            className="px-2 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-xs text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
          >
            {pageSizeOptions!.map(size => (
              <option key={size} value={size}>{size}개씩 보기</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-1">
        {showFirstLast && (
          <button onClick={() => onPageChange(1)} disabled={page === 1} className={btnClass}>
            <ChevronsLeft size={13} />
          </button>
        )}
        <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className={btnClass}>
          <ChevronLeft size={13} />
        </button>
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-6 h-6 rounded text-xs transition-colors ${p === page ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {p}
          </button>
        ))}
        <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className={btnClass}>
          <ChevronRight size={13} />
        </button>
        {showFirstLast && (
          <button onClick={() => onPageChange(totalPages)} disabled={page === totalPages} className={btnClass}>
            <ChevronsRight size={13} />
          </button>
        )}
      </div>
    </div>
  )
}
