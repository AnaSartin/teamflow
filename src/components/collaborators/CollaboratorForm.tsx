'use client'

import { useState, useTransition } from 'react'
import { createCollaborator, updateCollaborator } from '@/app/actions/collaborators'
import { buildTitle, MACRO_LABELS } from '@/lib/utils'
import type { Collaborator, MacroRole, GridLevel, Team } from '@/types'

const TEAM_LEVELS = ['N1', 'N2', 'Coordenação']

const MACRO_OPTIONS = [
  { value: 'junior', label: 'Júnior' },
  { value: 'pleno', label: 'Pleno' },
  { value: 'senior', label: 'Sênior' },
  { value: 'especialista', label: 'Especialista' },
  { value: 'coordenador', label: 'Coordenador' },
  { value: 'gerente', label: 'Gerente' },
]

type Props = {
  collaborator?: Collaborator
  teams?: Team[]
}

export default function CollaboratorForm({ collaborator, teams = [] }: Props) {
  const isEdit = !!collaborator
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const [macroRole, setMacroRole] = useState<string>(collaborator?.macro_role ?? 'junior')
  const [gridLevel, setGridLevel] = useState<number>(collaborator?.grid_level ?? 1)
  const [teamId, setTeamId] = useState<string>(collaborator?.team_id ?? '')
  const [teamLevel, setTeamLevel] = useState<string>(collaborator?.team_level ?? '')

  // Derive team name for the text field
  const selectedTeam = teams.find(t => t.id === teamId)
  const teamName = selectedTeam?.name ?? collaborator?.team ?? ''

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)

    const payload = {
      name:                    fd.get('name') as string,
      email:                   fd.get('email') as string,
      macro_role:              macroRole as MacroRole,
      grid_level:              gridLevel as GridLevel,
      team:                    teamName,
      team_id:                 teamId || null,
      team_level:              teamLevel || null,
      manager:                 fd.get('manager') as string,
      admission_date:          fd.get('admission_date') as string,
      current_salary:          parseFloat(fd.get('current_salary') as string),
      last_raise_date:         fd.get('last_raise_date') as string,
      last_promotion_date:     fd.get('last_promotion_date') as string,
      next_level_forecast:     fd.get('next_level_forecast') as string,
      promotion_forecast_date: fd.get('promotion_forecast_date') as string,
      status:                  fd.get('status') as string,
      notes:                   fd.get('notes') as string,
    } as Parameters<typeof createCollaborator>[0]

    startTransition(async () => {
      const result = isEdit
        ? await updateCollaborator(collaborator.id, payload)
        : await createCollaborator(payload)
      if (result?.error) setError(result.error)
    })
  }

  const inputCls = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-50 disabled:text-slate-400'
  const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {/* Personal info */}
      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Dados pessoais e contato</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelCls}>Nome completo *</label>
            <input name="name" required defaultValue={collaborator?.name} className={inputCls} placeholder="Nome Sobrenome" />
          </div>
          <div>
            <label className={labelCls}>E-mail corporativo *</label>
            <input name="email" type="email" required defaultValue={collaborator?.email} className={inputCls} placeholder="nome@empresa.com.br" />
          </div>
          <div>
            <label className={labelCls}>Status *</label>
            <select name="status" required defaultValue={collaborator?.status ?? 'active'} className={inputCls}>
              <option value="active">Ativo</option>
              <option value="vacation">Férias</option>
              <option value="leave">Afastado</option>
              <option value="terminated">Desligado</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Gestor responsável</label>
            <input name="manager" defaultValue={collaborator?.manager} className={inputCls} placeholder="Nome do gestor" />
          </div>
        </div>
      </section>

      {/* Team assignment */}
      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Equipe</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Equipe *</label>
            {teams.length > 0 ? (
              <select
                value={teamId}
                onChange={e => setTeamId(e.target.value)}
                required
                className={inputCls}
              >
                <option value="">Selecione a equipe...</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}{t.type ? ` (${t.type})` : ''}</option>
                ))}
              </select>
            ) : (
              <input
                name="team_text"
                defaultValue={collaborator?.team}
                onChange={() => {}}
                className={inputCls}
                placeholder="Nenhuma equipe cadastrada ainda"
                readOnly
              />
            )}
            {teams.length === 0 && (
              <p className="text-xs text-slate-400 mt-1">
                <a href="/teams" className="text-blue-500 hover:underline">Cadastre equipes</a> para selecionar aqui.
              </p>
            )}
          </div>
          <div>
            <label className={labelCls}>Nível na equipe</label>
            <select
              value={teamLevel}
              onChange={e => setTeamLevel(e.target.value)}
              className={inputCls}
            >
              <option value="">Sem nível definido</option>
              {TEAM_LEVELS.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Grid position */}
      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Posição na grelha salarial</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Cargo macro *</label>
            <select
              value={macroRole}
              onChange={e => setMacroRole(e.target.value)}
              className={inputCls}
              required
            >
              {MACRO_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Nível *</label>
            <select
              value={gridLevel}
              onChange={e => setGridLevel(parseInt(e.target.value))}
              className={inputCls}
              required
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Cargo completo (automático)</label>
            <input value={buildTitle(macroRole as MacroRole, gridLevel as 1)} readOnly className={`${inputCls} bg-slate-50`} />
          </div>
          <div>
            <label className={labelCls}>Próximo nível previsto</label>
            <input name="next_level_forecast" defaultValue={collaborator?.next_level_forecast ?? ''} className={inputCls} placeholder="ex: pleno-1" />
          </div>
          <div>
            <label className={labelCls}>Previsão de promoção</label>
            <input name="promotion_forecast_date" type="date" defaultValue={collaborator?.promotion_forecast_date ?? ''} className={inputCls} />
          </div>
        </div>
      </section>

      {/* Salary & dates */}
      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Dados de admissão e salário</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Data de admissão *</label>
            <input name="admission_date" type="date" required defaultValue={collaborator?.admission_date} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Salário atual (R$) *</label>
            <input name="current_salary" type="number" step="0.01" required defaultValue={collaborator?.current_salary} className={inputCls} placeholder="5000.00" />
          </div>
          <div>
            <label className={labelCls}>Data do último reajuste</label>
            <input name="last_raise_date" type="date" defaultValue={collaborator?.last_raise_date ?? ''} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Data da última promoção</label>
            <input name="last_promotion_date" type="date" defaultValue={collaborator?.last_promotion_date ?? ''} className={inputCls} />
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Observações gerenciais</h3>
        <textarea name="notes" rows={3} defaultValue={collaborator?.notes ?? ''} className={inputCls} placeholder="Observações internas sobre este colaborador..." />
      </section>

      <div className="flex items-center justify-end gap-3 pb-4">
        <a href={isEdit ? `/collaborators/${collaborator.id}` : '/collaborators'} className="text-sm text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors">
          Cancelar
        </a>
        <button
          type="submit"
          disabled={isPending}
          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          {isPending ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Cadastrar colaborador'}
        </button>
      </div>
    </form>
  )
}
