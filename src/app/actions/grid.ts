'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateGridPosition(
  id: string,
  data: { salary_min: number; salary_max: number; notes?: string }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  if (data.salary_min <= 0) throw new Error('Salário mínimo deve ser maior que zero')
  if (data.salary_max <= data.salary_min) throw new Error('Salário máximo deve ser maior que o mínimo')

  const { error } = await supabase
    .from('salary_grid')
    .update({
      salary_min: data.salary_min,
      salary_max: data.salary_max,
      notes: data.notes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/grid')
}
