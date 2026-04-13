'use client'

import { useState, useTransition } from 'react'
import { createCollaborator, updateCollaborator } from '@/app/actions/collaborators'
import { buildTitle, MACRO_LABELS } from '@/lib/utils'
import type { Collaborator, MacroRole, GridLevel } from '@/types'

type Props = { collaborator?: Collaborator }

export default function CollaboratorForm({ collaborator }: Props) {
  const isEdit = !!collaborator
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const [macroRole, setMacroRole] = useState<MacroRole>(collaborator?.macro_role ?? 'junior')
  const [gridLevel, setGridLevel] = useState<GridLevel>(collaborator?.grid_level ?? 1)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)

    const payload = {
      name:                  fd.get('name') as string,
      email:                 fd.get('email') as string,
      macro_role:            fd.get('macro_role') as MacroRole,
      grid_level:            parseInt(fd.get('grid_level') as string) as GridLevel,
      team:                  fd.get('team') as string,
      manager:               fd.get('manager') as string,
      admission_date:        fd.get('admission_date') as string,
      current_salary:        parseFloat(fd.get('current_salary') as string),
      last_raise_date:       fd.get('last_raise_date') as string,
      last_promotion_date:   fd.get('last_promotion_date') as string,
      next_level_forecast:   fd.get('next_level_forecast') as string,
      promotion_forecast_date: fd.get('promotion_forecast_date') as string,
      status:                fd.get('status') as string,
      notes:                 fd.get('notes') as string,
    } as Parameters<typeof createCollaborator>[0]

    startTransition(async () => {
      try {
        if (isEdit) await updateCollaborator(collaborator.id, payload)
        else await createCollaborator(payload)
      } catch (err) {
        setError(String(err))
      }
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
            <label className={labelCls}>Equipe / Área *</label>
            <input name="team" required defaultValue={collaborator?.team} className={inputCls} placeholder="0401 - Suporte ao Cliente" />
          </div>
          <div>
            <label className={labelCls}>Gestor responsável</label>
            <input name="manager" defaultValue={collaborator?.manager} className={inputCls} placeholder="Nome do gestor" />
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
        </div>
      </section>

      {/* Grid position */}
      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Posição na grelha</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Cargo macro *</label>
            <select
              name="macro_role"
              required
              value={macroRole}
              onChange={e => setMacroRole(e.target.value as MacroRole)}
              className={inputCls}
            >
              {Object.entries(MACRO_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Nível *</label>
            <select
              name="grid_level"
              required
              value={gridLevel}
              onChange={e => setGridLevel(parseInt(e.target.value) as GridLevel)}
              className={inputCls}
            >
              {[1, 2, 3, 4].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Cargo completo (automático)</label>
            <input value={buildTitle(macroRole, gridLevel)} readOnly className={`${inputCls} bg-slate-50`} />
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
        <a href="/collaborators" className="text-sm text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors">
          Cancelar
        </a>
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          {isPending ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Cadastrar colaborador'}
        </button>
      </div>
    </form>
  )
}
