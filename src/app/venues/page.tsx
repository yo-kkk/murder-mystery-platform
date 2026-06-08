import { MapPin, Phone, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { VENUE_TYPE_LABEL } from '@/lib/utils'
import { getVenues } from '@/lib/supabase/queries'

export const revalidate = 60

export default async function VenuesPage() {
  const venues = await getVenues()

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <MapPin size={20} className="text-primary" />
          플레이 장소
        </h1>
        <p className="text-sm text-muted-foreground">머더미스터리를 플레이할 수 있는 곳을 찾아보세요</p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {['전체', '파티룸', '보드게임 카페', '방탈출 카페'].map(type => (
          <Badge
            key={type}
            variant={type === '전체' ? 'default' : 'outline'}
            className={
              type === '전체'
                ? 'bg-primary text-white cursor-pointer'
                : 'border-[var(--border)] text-muted-foreground cursor-pointer hover:border-primary/50 hover:text-foreground transition-colors'
            }
          >
            {type}
          </Badge>
        ))}
      </div>

      {venues.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          등록된 장소가 없어요
        </div>
      )}

      <div className="space-y-3">
        {venues.map(venue => (
          <div key={venue.id} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">{venue.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-[var(--border)] text-muted-foreground">
                    {VENUE_TYPE_LABEL[venue.type]}
                  </Badge>
                  <span className="text-xs text-[var(--gold)] flex items-center gap-0.5">
                    <Star size={11} className="fill-[var(--gold)]" />
                    {venue.avgRating}
                  </span>
                </div>
              </div>
              {venue.reservationUrl && (
                <a
                  href={venue.reservationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 rounded bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30 transition-colors"
                >
                  예약하기
                </a>
              )}
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5"><MapPin size={11} /> {venue.address}</p>
              {venue.phone && <p className="flex items-center gap-1.5"><Phone size={11} /> {venue.phone}</p>}
            </div>

            <p className="text-xs text-muted-foreground/60">보유 게임 {venue.availableGames.length}개</p>
          </div>
        ))}
      </div>
    </div>
  )
}
