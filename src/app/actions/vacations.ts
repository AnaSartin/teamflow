'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// ─── Schedule vacation ────────────────────────────────────────────────────────

export async function scheduleVacation(payload: {
  collaborator_id: string
  acquisition_start: string
  acquisition_end: string
  expiry_date: string
  scheduled_start: string
  scheduled_end: string
  notes?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  if (payload.scheduled_end <= payload.scheduled_start) {
    throw new Error('A data de retorno deve ser posterior ao início das férias')
  }

  // Check if there's already an active vacation record for this collaborator
  const { data: existing } = await supabase
    .from('vacations')
    .select('id, status')
    .eq('collaborator_id', payload.collaborator_id)
    .neq('status', 'completed')
    .maybeSingle()

  if (existing) {
    // Update existing record
    const { error } = await supabase
      .from('vacations')
      .update({
        acquisition_start: payload.acquisition_start,
        acquisition_end: payload.acquisition_end,
        expiry_date: payload.expiry_date,
        scheduled_start: payload.scheduled_start,
        scheduled_end: payload.scheduled_end,
        status: 'scheduled',
        notes: payload.notes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
    if (error) throw new Error(error.message)
  } else {
    // Insert new record
    const { error } = await supabase
      .from('vacations')
      .insert({
        collaborator_id: payload.collaborator_id,
        acquisition_start: payload.acquisition_start,
        acquisition_end: payload.acquisition_end,
        expiry_date: payload.expiry_date,
        scheduled_start: payload.scheduled_start,
        scheduled_end: payload.scheduled_end,
        status: 'scheduled',
        notes: payload.notes ?? null,
      })
    if (error) throw new Error(error.message)
  }

  revalidatePath('/vacations')
  revalidatePath(`/collaborators/${payload.collaborator_id}`)
}

// ─── Register new vacation period (aquisição) ─────────────────────────────────

export async function createVacationPeriod(payload: {
  collaborator_id: string
  acquisition_start: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const start = new Date(payload.acquisition_start)
  const acquisitionEnd = new Date(start)
  acquisitionEnd.setFullYear(acquisitionEnd.getFullYear() + 1)
  const expiryDate = new Date(acquisitionEnd)
  expiryDate.setFullYear(expiryDate.getFullYear() + 1)

  const fmt = (d: Date) => d.toISOString().split('T')[0]

  const { error } = await supabase.from('vacations').insert({
    collaborator_id: payload.collaborator_id,
    acquisition_start: payload.acquisition_start,
    acquisition_end: fmt(acquisitionEnd),
    expiry_date: fmt(expiryDate),
    status: 'not_scheduled',
  })
  if (error) throw new Error(error.message)

  revalidatePath('/vacations')
  revalidatePath(`/collaborators/${payload.collaborator_id}`)
}

// ─── Mark vacation as completed ───────────────────────────────────────────────

export async function completeVacation(id: string, collaborator_id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase
    .from('vacations')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/vacations')
  revalidatePath(`/collaborators/${collaborator_id}`)
}
