import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Difficulty, Theme, VenueType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급',
  expert: '전문가',
}

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  beginner: 'text-emerald-400',
  intermediate: 'text-yellow-400',
  advanced: 'text-orange-400',
  expert: 'text-red-500',
}

export const THEME_LABEL: Record<Theme, string> = {
  victorian: '빅토리안',
  modern: '현대',
  fantasy: '판타지',
  horror: '공포',
  comedy: '코미디',
  historical: '역사',
  scifi: 'SF',
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

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}
