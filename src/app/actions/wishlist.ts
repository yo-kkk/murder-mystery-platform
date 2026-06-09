'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleWishlist(gameId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  const { data: existing } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .maybeSingle()

  if (existing) {
    await supabase.from('wishlists').delete().eq('id', existing.id)
    revalidatePath('/games')
    return { wishlisted: false }
  } else {
    await supabase.from('wishlists').insert({ user_id: user.id, game_id: gameId })
    revalidatePath('/games')
    return { wishlisted: true }
  }
}
