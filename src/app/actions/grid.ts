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
    // Non-fatal — audit failure must not block the main operation
  }
}

// ─── Update grid position ─────────────────────────────────────────────────────
// Returns { error } instead of throwing so Next.js 15 production
// doesn't replace the message with the generic "Server Components render" error.

export async function updateGridPosition(
  id: string,
  data: { salary_min: number; salary_max: number; notes?: string }
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Sessão expirada. Faça login novamente.' }

    if (!Number.isFinite(data.salary_min) || data.salary_min <= 0)
      return { error: 'Salário mínimo inválido. Informe um valor maior que zero.' }

    if (!Number.isFinite(data.salary_max) || data.salary_max <= 0)
      return { error: 'Salário máximo inválido. Informe um valor maior que zero.' }

    if (data.salary_max <= data.salary_min)
      return { error: 'O salário máximo deve ser maior que o mínimo.' }

    // Fetch current values for audit trail (non-fatal if not found)
    const { data: current } = await supabase
      .from('salary_grid')
      .select('full_title, salary_min, salary_max')
      .eq('id', id)
      .single()

    const { error: dbError } = await supabase
      .from('salary_grid')
      .update({
        salary_min: data.salary_min,
        salary_max: data.salary_max,
        notes: data.notes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (dbError) return { error: `Erro ao salvar: ${dbError.message}` }

    await logAudit(supabase, user.email ?? 'desconhecido', id, current?.full_title ?? id, {
      salary_min_before: current?.salary_min,
      salary_max_before: current?.salary_max,
      salary_min_after: data.salary_min,
      salary_max_after: data.salary_max,
    })

    revalidatePath('/grid')
    return {}
  } catch (e) {
    // Last-resort catch — should not reach here in normal operation
    console.error('[updateGridPosition] unexpected error:', e)
    return { error: 'Ocorreu um erro inesperado. Tente novamente.' }
  }
}
