'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { buildTitle } from '@/lib/utils'
import type { CollaboratorFormValues, MacroRole, GridLevel } from '@/types'

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
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const full_title = buildTitle(payload.new_macro_role, payload.new_level)

  // Insert promotion record
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
  })
  if (promErr) throw new Error(promErr.message)

  // Insert salary history
  const { error: salErr } = await supabase.from('salary_history').insert({
    collaborator_id: payload.collaborator_id,
    event_date: payload.event_date,
    salary_before: payload.salary_before,
    salary_after: payload.salary_after,
    reason: `Promoção para ${full_title}`,
  })
  if (salErr) throw new Error(salErr.message)

  // Update collaborator
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
  if (updErr) throw new Error(updErr.message)

  revalidatePath(`/collaborators/${payload.collaborator_id}`)
}

// ─── Register Salary Raise ────────────────────────────────────────────────────

export async function registerRaise(payload: {
  collaborator_id: string
  salary_before: number
  salary_after: number
  event_date: string
  reason: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error: salErr } = await supabase.from('salary_history').insert({
    collaborator_id: payload.collaborator_id,
    event_date: payload.event_date,
    salary_before: payload.salary_before,
    salary_after: payload.salary_after,
    reason: payload.reason,
  })
  if (salErr) throw new Error(salErr.message)

  const { error: updErr } = await supabase
    .from('collaborators')
    .update({
      current_salary: payload.salary_after,
      last_raise_date: payload.event_date,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payload.collaborator_id)
  if (updErr) throw new Error(updErr.message)

  revalidatePath(`/collaborators/${payload.collaborator_id}`)
}
