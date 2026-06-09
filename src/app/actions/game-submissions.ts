'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitGame(formData: {
  title: string
  subtitle?: string
  description?: string
  minPlayers: number
  maxPlayers: number
  durationMinutes: number
  maxDurationMinutes?: number
  requiresGm: boolean
  publisher?: string
  releaseYear?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요' }

  const { error } = await supabase.from('game_submissions').insert({
    user_id: user.id,
    title: formData.title,
    subtitle: formData.subtitle || null,
    description: formData.description || null,
    min_players: formData.minPlayers,
    max_players: formData.maxPlayers,
    duration_minutes: formData.durationMinutes,
    max_duration_minutes: formData.maxDurationMinutes || null,
    requires_gm: formData.requiresGm,
    publisher: formData.publisher || null,
    release_year: formData.releaseYear || null,
  })

  if (error) return { error: '제출 중 오류가 발생했어요' }
  return { success: true }
}

export async function approveSubmission(submissionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '권한 없음' }

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return { error: '권한 없음' }

  const { data: sub } = await supabase
    .from('game_submissions').select('*').eq('id', submissionId).single()
  if (!sub) return { error: '제출 내역 없음' }

  // short_id 생성
  const shortId = Math.random().toString(36).slice(2, 10)

  const { error: insertError } = await supabase.from('games').insert({
    short_id: shortId,
    title: sub.title,
    subtitle: sub.subtitle,
    description: sub.description,
    min_players: sub.min_players,
    max_players: sub.max_players,
    duration_minutes: sub.duration_minutes,
    max_duration_minutes: sub.max_duration_minutes,
    requires_gm: sub.requires_gm,
    publisher: sub.publisher,
    release_year: sub.release_year,
    avg_rating: 0,
    bayesian_rating: 0,
    review_count: 0,
    wishlist_count: 0,
  })

  if (insertError) return { error: '게임 등록 실패: ' + insertError.message }

  await supabase.from('game_submissions').update({
    status: 'approved',
    reviewed_at: new Date().toISOString(),
  }).eq('id', submissionId)

  revalidatePath('/games')
  revalidatePath('/admin')
  return { success: true }
}

export async function rejectSubmission(submissionId: string, note?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '권한 없음' }

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return { error: '권한 없음' }

  await supabase.from('game_submissions').update({
    status: 'rejected',
    reviewer_note: note || null,
    reviewed_at: new Date().toISOString(),
  }).eq('id', submissionId)

  revalidatePath('/admin')
  return { success: true }
}
