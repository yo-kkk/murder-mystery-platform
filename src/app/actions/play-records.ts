'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addPlayRecord(formData: {
  gameId: string
  playedAt: string
  venueName?: string
  companions: string[]
  memo: string
  imageUrls?: string[]
  isBest?: boolean
  skipReview: boolean
  rating?: number
  comment?: string
  tags?: string[]
  isPublicReview?: boolean
  isReviewBest?: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  // 기록 저장
  const { error: recordError } = await supabase
    .from('play_records')
    .insert({
      user_id: user.id,
      game_id: formData.gameId,
      played_at: formData.playedAt,
      venue_name: formData.venueName || null,
      companions: formData.companions,
      memo: formData.memo,
      image_urls: formData.imageUrls ?? [],
      is_best: formData.isBest ?? false,
      is_public: false,
    })

  if (recordError) return { error: '기록 저장에 실패했어요.' }

  // 리뷰 저장 (리뷰하지 않기가 아닐 때만)
  if (!formData.skipReview && formData.rating && formData.rating > 0) {
    const { error: reviewError } = await supabase.from('reviews').insert({
      user_id: user.id,
      game_id: formData.gameId,
      rating: formData.rating,
      difficulty_rating: formData.rating,
      atmosphere_rating: formData.rating,
      comment: formData.comment || '',
      tags: formData.tags ?? [],
      is_spoiler: false,
      is_public: formData.isPublicReview ?? false,
      is_best: formData.isReviewBest ?? false,
    })

    if (reviewError) console.error('리뷰 저장 실패:', reviewError)
  }

  revalidatePath('/')
  revalidatePath('/games')
  return { success: true }
}

export async function updatePlayRecord(id: string, formData: {
  playedAt: string
  venueName?: string
  companions: string[]
  memo: string
  imageUrls?: string[]
  isBest?: boolean
  gameId?: string
  skipReview?: boolean
  rating?: number
  comment?: string
  tags?: string[]
  isPublicReview?: boolean
  isReviewBest?: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  const { error } = await supabase
    .from('play_records')
    .update({
      played_at: formData.playedAt,
      venue_name: formData.venueName || null,
      companions: formData.companions,
      memo: formData.memo,
      image_urls: formData.imageUrls ?? [],
      is_best: formData.isBest ?? false,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: '수정에 실패했어요.' }

  if (formData.gameId) {
    if (!formData.skipReview && formData.rating) {
      await supabase.from('reviews')
        .upsert({
          user_id: user.id,
          game_id: formData.gameId,
          rating: formData.rating,
          difficulty_rating: formData.rating,
          atmosphere_rating: formData.rating,
          comment: formData.comment || '',
          tags: formData.tags ?? [],
          is_spoiler: false,
          is_public: formData.isPublicReview ?? false,
          is_best: formData.isReviewBest ?? false,
        }, { onConflict: 'user_id,game_id' })
    } else if (formData.skipReview) {
      await supabase.from('reviews')
        .delete()
        .eq('user_id', user.id)
        .eq('game_id', formData.gameId)
    }
  }

  revalidatePath('/')
  revalidatePath('/games')
  return { success: true }
}

export async function deletePlayRecord(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  // 기록에 연결된 game_id 먼저 조회
  const { data: record } = await supabase
    .from('play_records')
    .select('game_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  const { error } = await supabase
    .from('play_records')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: '삭제에 실패했어요.' }

  // 연결된 리뷰도 삭제
  if (record?.game_id) {
    await supabase
      .from('reviews')
      .delete()
      .eq('user_id', user.id)
      .eq('game_id', record.game_id)
  }

  revalidatePath('/')
  revalidatePath('/games')
  revalidatePath('/my-records')
  return { success: true }
}
