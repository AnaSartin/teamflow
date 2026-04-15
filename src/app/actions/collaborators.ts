'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { buildTitle } from '@/lib/utils'
import type { CollaboratorFormValues, CollaboratorStatus, MacroRole, GridLevel } from '@/types'
import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Audit helper ─────────────────────────────────────────────────────────────

async function logAudit(
  supabase: SupabaseClient,
  performed_by: string,
  entity: string,
  entity_id: string,
  entity_name: string,
  action: string,
  details?: Record<string, unknown>
) {
  try {
    await supabase.from('audit_log').insert({
      performed_by,
      entity,
      entity_id,
      entity_name,
      action,
      details: details ?? null,
    })
  } catch {
    // Non-fatal: audit failure must not break the main operation
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createCollaborator(data: CollaboratorFormValues) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const full_title = buildTitle(data.macro_role, data.grid_level)

  const { data: collab, error } = await supabase
    .from('collaborators')
    .insert({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      macro_role: data.macro_role,
      grid_level: data.grid_level,
      full_title,
      team: data.team.trim(),
      manager: data.manager.trim(),
      admission_date: data.admission_date,
      current_salary: data.current_salary,
      last_raise_date: data.last_raise_date || null,
      last_promotion_date: data.last_promotion_date || null,
      next_level_forecast: data.next_level_forecast || null,
      promotion_forecast_date: data.promotion_forecast_date || null,
      status: data.status,
      notes: data.notes || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  await logAudit(supabase, user.email!, 'collaborator', collab.id, collab.name, 'create', {
    macro_role: data.macro_role,
    grid_level: data.grid_level,
    team: data.team,
  })

  revalidatePath('/collaborators')
  redirect(`/collaborators/${collab.id}`)
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateCollaborator(id: string, data: CollaboratorFormValues) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const full_title = buildTitle(data.macro_role, data.grid_level)

  const { error } = await supabase
    .from('collaborators')
    .update({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      macro_role: data.macro_role,
      grid_level: data.grid_level,
      full_title,
      team: data.team.trim(),
      manager: data.manager.trim(),
      admission_date: data.admission_date,
      current_salary: data.current_salary,
      last_raise_date: data.last_raise_date || null,
      last_promotion_date: data.last_promotion_date || null,
      next_level_forecast: data.next_level_forecast || null,
      promotion_forecast_date: data.promotion_forecast_date || null,
      status: data.status,
      notes: data.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  await logAudit(supabase, user.email!, 'collaborator', id, data.name, 'update', {
    macro_role: data.macro_role,
    grid_level: data.grid_level,
  })

  revalidatePath(`/collaborators/${id}`)
  revalidatePath('/collaborators')
  redirect(`/collaborators/${id}`)
}

// ─── Register Promotion ───────────────────────────────────────────────────────

export async function registerPromotion(payload: {
  collaborator_id: string
  new_macro_role: MacroRole
  new_level: GridLevel
  salary_before: number
  salary_after: number
  event_date: string
  notes: string
  previous_macro_role: MacroRole
  previous_level: GridLevel
  collaborator_name: string
}): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Sessão expirada. Faça login novamente.' }

    const full_title = buildTitle(payload.new_macro_role, payload.new_level)

    const { error: promErr } = await supabase.from('promotion_history').insert({
      collaborator_id: payload.collaborator_id,
      event_date: payload.event_date,
      previous_macro_role: payload.previous_macro_role,
      previous_level: payload.previous_level,
      new_macro_role: payload.new_macro_role,
      new_level: payload.new_level,
      salary_before: payload.salary_before,
      salary_after: payload.salary_after,
      notes: payload.notes || null,
      performed_by_email: user.email,
    })
    if (promErr) return { error: `Erro ao registrar promoção: ${promErr.message}` }

    const { error: salErr } = await supabase.from('salary_history').insert({
      collaborator_id: payload.collaborator_id,
      event_date: payload.event_date,
      salary_before: payload.salary_before,
      salary_after: payload.salary_after,
      reason: `Promoção para ${full_title}`,
      performed_by_email: user.email,
    })
    if (salErr) return { error: `Erro ao registrar histórico salarial: ${salErr.message}` }

    const { error: updErr } = await supabase
      .from('collaborators')
      .update({
        macro_role: payload.new_macro_role,
        grid_level: payload.new_level,
        full_title,
        current_salary: payload.salary_after,
        last_promotion_date: payload.event_date,
        last_raise_date: payload.event_date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payload.collaborator_id)
    if (updErr) return { error: `Erro ao atualizar colaborador: ${updErr.message}` }

    await logAudit(supabase, user.email ?? 'desconhecido', 'collaborator', payload.collaborator_id, payload.collaborator_name, 'promotion', {
      from: `${payload.previous_macro_role} N${payload.previous_level}`,
      to: `${payload.new_macro_role} N${payload.new_level}`,
      salary_before: payload.salary_before,
      salary_after: payload.salary_after,
    })

    revalidatePath(`/collaborators/${payload.collaborator_id}`)
    return {}
  } catch (e) {
    console.error('[registerPromotion] unexpected error:', e)
    return { error: 'Ocorreu um erro inesperado. Tente novamente.' }
  }
}

// ─── Register Salary Raise ────────────────────────────────────────────────────

export async function registerRaise(payload: {
  collaborator_id: string
  salary_before: number
  salary_after: number
  event_date: string
  reason: string
  collaborator_name: string
}): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Sessão expirada. Faça login novamente.' }

    if (!payload.reason?.trim()) return { error: 'Informe o motivo do reajuste.' }
    if (payload.salary_after <= 0) return { error: 'Novo salário deve ser maior que zero.' }

    const { error: salErr } = await supabase.from('salary_history').insert({
      collaborator_id: payload.collaborator_id,
      event_date: payload.event_date,
      salary_before: payload.salary_before,
      salary_after: payload.salary_after,
      reason: payload.reason,
      performed_by_email: user.email,
    })
    if (salErr) return { error: `Erro ao registrar histórico: ${salErr.message}` }

    const { error: updErr } = await supabase
      .from('collaborators')
      .update({
        current_salary: payload.salary_after,
        last_raise_date: payload.event_date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payload.collaborator_id)
    if (updErr) return { error: `Erro ao atualizar colaborador: ${updErr.message}` }

    await logAudit(supabase, user.email ?? 'desconhecido', 'collaborator', payload.collaborator_id, payload.collaborator_name, 'salary_raise', {
      salary_before: payload.salary_before,
      salary_after: payload.salary_after,
      reason: payload.reason,
    })

    revalidatePath(`/collaborators/${payload.collaborator_id}`)
    return {}
  } catch (e) {
    console.error('[registerRaise] unexpected error:', e)
    return { error: 'Ocorreu um erro inesperado. Tente novamente.' }
  }
}

// ─── Update Status ────────────────────────────────────────────────────────────

export async function updateCollaboratorStatus(id: string, status: CollaboratorStatus, collaborator_name?: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Sessão expirada. Faça login novamente.' }

    const { error } = await supabase
      .from('collaborators')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return { error: `Erro ao atualizar status: ${error.message}` }

    await logAudit(supabase, user.email ?? 'desconhecido', 'collaborator', id, collaborator_name ?? id, 'status_change', { status })

    revalidatePath('/collaborators')
    revalidatePath(`/collaborators/${id}`)
    return {}
  } catch (e) {
    console.error('[updateCollaboratorStatus] unexpected error:', e)
    return { error: 'Ocorreu um erro inesperado. Tente novamente.' }
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteCollaborator(id: string, collaborator_name?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  await supabase.from('vacations').delete().eq('collaborator_id', id)
  await supabase.from('promotion_history').delete().eq('collaborator_id', id)
  await supabase.from('salary_history').delete().eq('collaborator_id', id)

  const { error } = await supabase.from('collaborators').delete().eq('id', id)
  if (error) throw new Error(error.message)

  await logAudit(supabase, user.email!, 'collaborator', id, collaborator_name ?? id, 'delete')

  revalidatePath('/collaborators')
  redirect('/collaborators')
}

// ─── Bulk import (CSV) ────────────────────────────────────────────────────────

export interface CSVRow {
  name: string
  email: string
  macro_role: MacroRole
  grid_level: GridLevel
  team: string
  manager: string
  admission_date: string
  current_salary: number
  status: CollaboratorStatus
  notes?: string
}

export async function bulkImportCollaborators(rows: CSVRow[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const records = rows.map(row => ({
    name: row.name.trim(),
    email: row.email.trim().toLowerCase(),
    macro_role: row.macro_role,
    grid_level: row.grid_level,
    full_title: buildTitle(row.macro_role, row.grid_level),
    team: row.team.trim(),
    manager: row.manager?.trim() ?? '',
    admission_date: row.admission_date,
    current_salary: row.current_salary,
    status: row.status,
    notes: row.notes?.trim() ?? null,
  }))

  const { error, data } = await supabase
    .from('collaborators')
    .insert(records)
    .select('id')

  if (error) throw new Error(error.message)
  revalidatePath('/collaborators')
  return { inserted: data?.length ?? 0 }
}
