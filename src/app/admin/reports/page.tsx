import { Flag } from 'lucide-react'

export default function AdminReportsPage() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] p-12 text-center space-y-3">
      <Flag size={28} className="mx-auto text-muted-foreground/40" />
      <p className="text-sm font-medium text-muted-foreground">평가 신고 확인</p>
      <p className="text-xs text-muted-foreground/60">신고된 리뷰를 검토하는 기능이 들어올 예정이에요</p>
    </div>
  )
}
