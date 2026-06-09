import { FilePen } from 'lucide-react'

export default function AdminGameEditsPage() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] p-12 text-center space-y-3">
      <FilePen size={28} className="mx-auto text-muted-foreground/40" />
      <p className="text-sm font-medium text-muted-foreground">게임 수정 요청</p>
      <p className="text-xs text-muted-foreground/60">유저가 제출한 게임 정보 수정 요청을 검토하는 기능이 들어올 예정이에요</p>
    </div>
  )
}
