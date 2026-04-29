'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// ─── Create team ──────────────────────────────────────────────────────────────

export async function createTeam(data: {
  name: string
  type?: string
}): Promise<{ error?: string; id?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Sessão expirada. Faça login novamente.' }

    if (!data.name?.trim()) return { error: 'Nome da equipe é obrigatório.' }

    const { data: team, error } = await supabase
      .from('teams')
      .insert({
        name: data.name.trim(),
        type: data.type?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') return { error: `Já existe uma equipe com o nome "${data.name}".` }
      return { error: `Erro ao criar equipe: ${error.message}` }
    }

    revalidatePath('/teams')
    revalidatePath('/collaborators')
    return { id: team.id }
  } catch (e) {
    console.error('[createTeam]', e)
    return { error: 'Ocorreu um erro inesperado. Tente novamente.' }
  }
}

// ─── Update team ──────────────────────────────────────────────────────────────

export async function updateTeam(
  id: string,
  data: { name: string; type?: string }
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Sessão expirada. Faça login novamente.' }

    if (!data.name?.trim()) return { error: 'Nome da equipe é obrigatório.' }

    const { error } = await supabase
      .from('teams')
      .update({
        name: data.name.trim(),
        type: data.type?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      if (error.code === '23505') return { error: `Já existe uma equipe com o nome "${data.name}".` }
      return { error: `Erro ao atualizar: ${error.message}` }
    }

    revalidatePath('/teams')
    revalidatePath('/collaborators')
    return {}
  } catch (e) {
    console.error('[updateTeam]', e)
    return { error: 'Ocorreu um erro inesperado. Tente novamente.' }
  }
}

// ─── Delete team ──────────────────────────────────────────────────────────────

export async function deleteTeam(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Sessão expirada. Faça login novamente.' }

    // Block deletion if collaborators are linked
    const { count } = await supabase
      .from('collaborators')
      .select('id', { count: 'exact', head: true })
      .eq('team_id', id)
      .neq('status', 'terminated')

    if (count && count > 0)
      return { error: `Há ${count} colaborador${count > 1 ? 'es' : ''} ativo${count > 1 ? 's' : ''} nesta equipe. Reatribua-os antes de excluir.` }

    const { error } = await supabase.from('teams').delete().eq('id', id)
    if (error) return { error: `Erro ao excluir: ${error.message}` }

    revalidatePath('/teams')
    return {}
  } catch (e) {
    console.error('[deleteTeam]', e)
    return { error: 'Ocorreu um erro inesperado. Tente novamente.' }
  }
}
