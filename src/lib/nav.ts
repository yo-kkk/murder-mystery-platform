import { Search, BookOpen, MapPin, User } from 'lucide-react'

export const NAV = [
  { href: '/games', label: '검색', icon: Search, match: (p: string) => p === '/games' || p.startsWith('/games/') },
  { href: '/my-records', label: '내 기록', icon: BookOpen, match: (p: string) => p.startsWith('/my-records') },
  { href: '/venues', label: '장소', icon: MapPin, match: (p: string) => p.startsWith('/venues') },
  { href: '/profile', label: '프로필', icon: User, match: (p: string) => p.startsWith('/profile') },
]
