'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitFeedback(content: string, pageUrl: string) {
  if (!content.trim()) return { error: '내용을 입력해주세요.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let nickname: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', user.id)
      .single()
    nickname = profile?.nickname ?? null
  }

  const { error } = await supabase.from('feedback').insert({
    user_id: user?.id ?? null,
    nickname,
    content: content.trim(),
    page_url: pageUrl,
  })

  if (error) return { error: '제출에 실패했어요. 다시 시도해주세요.' }
  return { success: true }
}

export async function resolveFeedback(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '권한이 없어요.' }

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return { error: '권한이 없어요.' }

  const { error } = await supabase
    .from('feedback')
    .update({ resolved: true, resolved_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: '처리에 실패했어요.' }
  return { success: true }
}
