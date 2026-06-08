import { MapPin, Phone, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { VENUE_TYPE_LABEL } from '@/lib/utils'
import type { Venue } from '@/types'
import venuesData from '../../../mocks/data/venues.json'

const venues = venuesData as Venue[]

export default function VenuesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Venues list */}
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
                <button className="text-xs px-3 py-1.5 rounded bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30 transition-colors">
                  예약하기
                </button>
              )}
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <MapPin size={11} /> {venue.address}
              </p>
              {venue.phone && (
                <p className="flex items-center gap-1.5">
                  <Phone size={11} /> {venue.phone}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs text-muted-foreground/60 mb-1.5">보유 게임 {venue.availableGames.length}개</p>
              <div className="flex flex-wrap gap-1">
                {venue.availableGames.slice(0, 3).map(gid => (
                  <span key={gid} className="text-xs px-2 py-0.5 rounded bg-[var(--border)] text-muted-foreground">
                    게임 #{gid.split('-')[1]}
                  </span>
                ))}
                {venue.availableGames.length > 3 && (
                  <span className="text-xs px-2 py-0.5 rounded bg-[var(--border)] text-muted-foreground">
                    +{venue.availableGames.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
