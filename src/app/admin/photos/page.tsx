import { ImagePlus } from 'lucide-react'

export default function AdminPhotosPage() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] p-12 text-center space-y-3">
      <ImagePlus size={28} className="mx-auto text-muted-foreground/40" />
      <p className="text-sm font-medium text-muted-foreground">게임 사진 선택</p>
      <p className="text-xs text-muted-foreground/60">제출된 사진 중 대표 사진을 선택하는 기능이 들어올 예정이에요</p>
    </div>
  )
}
