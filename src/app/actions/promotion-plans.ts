'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { buildTitle } from '@/lib/utils'
import type { SupabaseClient } from '@supabase/supabase-js'

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
      entity: 'promotion_plans',
      entity_id,
      entity_name,
      action,
      details: details ?? null,
    })
  } catch { /* Non-fatal */ }
}

// ─── Create plan ──────────────────────────────────────────────────────────────

export async function createPromotionPlan(data: {
  collaborator_id: string
  collaborator_name: string
  new_macro_role: string
  new_grid_level: number
  new_salary: number
  effective_date: string
  notes?: string
}): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Sessão expirada. Faça login novamente.' }

    if (!data.collaborator_id) return { error: 'Colaborador não especificado.' }
    if (!data.new_macro_role?.trim()) return { error: 'Cargo de destino é obrigatório.' }
    if (!Number.isFinite(data.new_grid_level) || data.new_grid_level < 1)
      return { error: 'Nível inválido.' }
    if (!Number.isFinite(data.new_salary) || data.new_salary <= 0)
      return { error: 'Salário previsto deve ser maior que zero.' }
    if (!data.effective_date) return { error: 'Data de vigência é obrigatória.' }
    if (new Date(data.effective_date) <= new Date())
      return { error: 'A data de vigência deve ser futura.' }

    const new_full_title = buildTitle(data.new_macro_role as 'junior' | 'pleno' | 'senior', data.new_grid_level as 1)

    const { data: plan, error } = await supabase
      .from('promotion_plans')
      .insert({
        collaborator_id: data.collaborator_id,
        new_macro_role: data.new_macro_role.trim(),
        new_grid_level: data.new_grid_level,
        new_full_title,
        new_salary: data.new_salary,
        effective_date: data.effective_date,
        status: 'planned',
        notes: data.notes?.trim() || null,
        created_by: user.email,
      })
      .select()
      .single()

    if (error) return { error: `Erro ao criar plano: ${error.message}` }

    await logAudit(supabase, user.email ?? 'desconhecido', plan.id, data.collaborator_name, 'plan_create', {
      new_macro_role: data.new_macro_role,
      new_grid_level: data.new_grid_level,
      new_salary: data.new_salary,
      effective_date: data.effective_date,
    })

    revalidatePath(`/collaborators/${data.collaborator_id}`)
    revalidatePath('/dashboard')
    return {}
  } catch (e) {
    console.error('[createPromotionPlan]', e)
    return { error: 'Ocorreu um erro inesperado. Tente novamente.' }
  }
}

// ─── Apply plan (promotes collaborator immediately) ───────────────────────────

export async function applyPromotionPlan(
  planId: string,
  collaboratorName: string
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Sessão expirada. Faça login novamente.' }

    const { data: plan, error: fetchErr } = await supabase
      .from('promotion_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (fetchErr || !plan) return { error: 'Plano não encontrado.' }
    if (plan.status !== 'planned') return { error: 'Este plano já foi aplicado ou cancelado.' }

    // Get current collaborator data
    const { data: collab } = await supabase
      .from('collaborators')
      .select('macro_role, grid_level, current_salary')
      .eq('id', plan.collaborator_id)
      .single()

    if (!collab) return { error: 'Colaborador não encontrado.' }

    const today = new Date().toISOString().split('T')[0]

    // Insert promotion history
    await supabase.from('promotion_history').insert({
      collaborator_id: plan.collaborator_id,
      event_date: today,
      previous_macro_role: collab.macro_role,
      previous_level: collab.grid_level,
      new_macro_role: plan.new_macro_role,
      new_level: plan.new_grid_level,
      salary_before: collab.current_salary,
      salary_after: plan.new_salary,
      notes: `Plano aplicado: ${plan.notes ?? ''}`.trim(),
      performed_by_email: user.email,
    })

    // Insert salary history
    await supabase.from('salary_history').insert({
      collaborator_id: plan.collaborator_id,
      event_date: today,
      salary_before: collab.current_salary,
      salary_after: plan.new_salary,
      reason: `Promoção planejada para ${plan.new_full_title}`,
      performed_by_email: user.email,
    })

    // Update collaborator
    await supabase.from('collaborators').update({
      macro_role: plan.new_macro_role,
      grid_level: plan.new_grid_level,
      full_title: plan.new_full_title,
      current_salary: plan.new_salary,
      last_promotion_date: today,
      last_raise_date: today,
      updated_at: new Date().toISOString(),
    }).eq('id', plan.collaborator_id)

    // Mark plan as applied
    await supabase.from('promotion_plans').update({
      status: 'applied',
      updated_at: new Date().toISOString(),
    }).eq('id', planId)

    await logAudit(supabase, user.email ?? 'desconhecido', planId, collaboratorName, 'plan_apply', {
      new_macro_role: plan.new_macro_role,
      new_salary: plan.new_salary,
    })

    revalidatePath(`/collaborators/${plan.collaborator_id}`)
    revalidatePath('/dashboard')
    return {}
  } catch (e) {
    console.error('[applyPromotionPlan]', e)
    return { error: 'Ocorreu um erro inesperado. Tente novamente.' }
  }
}

// ─── Cancel plan ──────────────────────────────────────────────────────────────

export async function cancelPromotionPlan(
  planId: string,
  collaboratorName: string
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Sessão expirada. Faça login novamente.' }

    const { data: plan } = await supabase
      .from('promotion_plans')
      .select('collaborator_id, status')
      .eq('id', planId)
      .single()

    if (!plan) return { error: 'Plano não encontrado.' }
    if (plan.status !== 'planned') return { error: 'Somente planos com status "planejado" podem ser cancelados.' }

    const { error } = await supabase
      .from('promotion_plans')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', planId)

    if (error) return { error: `Erro ao cancelar: ${error.message}` }

    await logAudit(supabase, user.email ?? 'desconhecido', planId, collaboratorName, 'plan_cancel')

    revalidatePath(`/collaborators/${plan.collaborator_id}`)
    revalidatePath('/dashboard')
    return {}
  } catch (e) {
    console.error('[cancelPromotionPlan]', e)
    return { error: 'Ocorreu um erro inesperado. Tente novamente.' }
  }
}
