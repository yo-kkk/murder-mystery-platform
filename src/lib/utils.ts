import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { VenueType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const VENUE_TYPE_LABEL: Record<VenueType, string> = {
  party_room: '파티룸',
  board_game_cafe: '보드게임 카페',
  escape_room: '방탈출 카페',
  home: '홈파티',
  online: '온라인',
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}분`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`
}

export function formatDurationRange(min: number, max?: number): string {
  if (!max || max === min) return `약 ${formatDuration(min)}`

  const minMins = min % 60
  const maxMins = max % 60

  // 둘 다 정각 시간이면 "2~8시간"
  if (min >= 60 && max >= 60 && minMins === 0 && maxMins === 0) {
    return `약 ${min / 60}~${max / 60}시간`
  }

  // 둘 다 60분 미만이면 "60~90분"
  if (min < 60 && max < 60) {
    return `약 ${min}~${max}분`
  }

  return `약 ${formatDuration(min)}~${formatDuration(max)}`
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number)
  return `${year}년 ${month}월 ${day}일`
}

export type GameSortKey = 'rating' | 'reviews' | 'newest' | 'title' | 'wishlist'

export function sortGames<T extends { bayesianRating?: number; avgRating?: number; reviewCount?: number; releaseYear?: number; wishlistCount?: number; title: string }>(
  games: T[],
  sort: GameSortKey
): T[] {
  return [...games].sort((a, b) => {
    switch (sort) {
      case 'rating':   return (b.bayesianRating ?? b.avgRating ?? 0) - (a.bayesianRating ?? a.avgRating ?? 0)
      case 'reviews':  return (b.reviewCount ?? 0) - (a.reviewCount ?? 0)
      case 'newest':   return (b.releaseYear ?? 0) - (a.releaseYear ?? 0)
      case 'wishlist': return (b.wishlistCount ?? 0) - (a.wishlistCount ?? 0)
      case 'title':    return a.title.localeCompare(b.title, 'ko')
      default:         return 0
    }
  })
}
