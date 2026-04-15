'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Audit helper ─────────────────────────────────────────────────────────────

async function logAudit(
  supabase: SupabaseClient,
  performed_by: string,
  entity_id: string,
  entity_name: string,
  details?: Record<string, unknown>
) {
  try {
    await supabase.from('audit_log').insert({
      performed_by,
      entity: 'salary_grid',
      entity_id,
      entity_name,
      action: 'grid_update',
      details: details ?? null,
    })
  } catch {
    // Non-fatal
  }
}

// ─── Update grid position ─────────────────────────────────────────────────────

export async function updateGridPosition(
  id: string,
  data: { salary_min: number; salary_max: number; notes?: string }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  if (data.salary_min <= 0) throw new Error('Salário mínimo deve ser maior que zero')
  if (data.salary_max <= data.salary_min) throw new Error('Salário máximo deve ser maior que o mínimo')

  // Fetch current values for audit trail
  const { data: current } = await supabase
    .from('salary_grid')
    .select('full_title, salary_min, salary_max')
    .eq('id', id)
    .single()

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

  await logAudit(supabase, user.email!, id, current?.full_title ?? id, {
    salary_min_before: current?.salary_min,
    salary_max_before: current?.salary_max,
    salary_min_after: data.salary_min,
    salary_max_after: data.salary_max,
  })

  revalidatePath('/grid')
}
