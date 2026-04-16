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
  action: string,
  details?: Record<string, unknown>
) {
  try {
    await supabase.from('audit_log').insert({
      performed_by,
      entity: 'salary_grid',
      entity_id,
      entity_name,
      action,
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

    await logAudit(supabase, user.email ?? 'desconhecido', id, current?.full_title ?? id, 'grid_update', {
      salary_min_before: current?.salary_min,
      salary_max_before: current?.salary_max,
      salary_min_after: data.salary_min,
      salary_max_after: data.salary_max,
    })

    revalidatePath('/grid')
    return {}
  } catch (e) {
    console.error('[updateGridPosition] unexpected error:', e)
    return { error: 'Ocorreu um erro inesperado. Tente novamente.' }
  }
}

// ─── Create grid position ─────────────────────────────────────────────────────

export async function createGridPosition(data: {
  macro_role: string
  grid_level: number
  full_title: string
  salary_min: number
  salary_max: number
  notes?: string
}): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Sessão expirada. Faça login novamente.' }

    if (!data.macro_role?.trim()) return { error: 'Informe o cargo macro.' }
    if (!data.full_title?.trim()) return { error: 'Informe o título completo.' }
    if (!Number.isFinite(data.grid_level) || data.grid_level < 1)
      return { error: 'Nível deve ser 1 ou maior.' }
    if (!Number.isFinite(data.salary_min) || data.salary_min <= 0)
      return { error: 'Salário mínimo deve ser maior que zero.' }
    if (!Number.isFinite(data.salary_max) || data.salary_max <= 0)
      return { error: 'Salário máximo deve ser maior que zero.' }
    if (data.salary_max <= data.salary_min)
      return { error: 'O salário máximo deve ser maior que o mínimo.' }

    const { data: inserted, error: dbError } = await supabase
      .from('salary_grid')
      .insert({
        macro_role: data.macro_role.trim().toLowerCase(),
        grid_level: data.grid_level,
        full_title: data.full_title.trim(),
        salary_min: data.salary_min,
        salary_max: data.salary_max,
        notes: data.notes?.trim() || null,
      })
      .select()
      .single()

    if (dbError) {
      if (dbError.code === '23505')
        return { error: `Já existe um cargo "${data.macro_role}" nível ${data.grid_level}.` }
      return { error: `Erro ao criar cargo: ${dbError.message}` }
    }

    await logAudit(supabase, user.email ?? 'desconhecido', inserted.id, inserted.full_title, 'grid_create', {
      macro_role: data.macro_role,
      grid_level: data.grid_level,
      salary_min: data.salary_min,
      salary_max: data.salary_max,
    })

    revalidatePath('/grid')
    return {}
  } catch (e) {
    console.error('[createGridPosition] unexpected error:', e)
    return { error: 'Ocorreu um erro inesperado. Tente novamente.' }
  }
}

// ─── Delete grid position ─────────────────────────────────────────────────────

export async function deleteGridPosition(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Sessão expirada. Faça login novamente.' }

    // Fetch the position being deleted
    const { data: position } = await supabase
      .from('salary_grid')
      .select('macro_role, grid_level, full_title')
      .eq('id', id)
      .single()

    if (!position) return { error: 'Cargo não encontrado.' }

    // Check if any collaborator is currently in this position
    const { count } = await supabase
      .from('collaborators')
      .select('id', { count: 'exact', head: true })
      .eq('macro_role', position.macro_role)
      .eq('grid_level', position.grid_level)
      .neq('status', 'terminated')

    if (count && count > 0)
      return { error: `Há ${count} colaborador${count > 1 ? 'es' : ''} ativo${count > 1 ? 's' : ''} neste cargo. Remova ou reclassifique-os antes de excluir.` }

    const { error: dbError } = await supabase
      .from('salary_grid')
      .delete()
      .eq('id', id)

    if (dbError) return { error: `Erro ao excluir: ${dbError.message}` }

    await logAudit(supabase, user.email ?? 'desconhecido', id, position.full_title, 'grid_delete', {
      macro_role: position.macro_role,
      grid_level: position.grid_level,
    })

    revalidatePath('/grid')
    return {}
  } catch (e) {
    console.error('[deleteGridPosition] unexpected error:', e)
    return { error: 'Ocorreu um erro inesperado. Tente novamente.' }
  }
}
