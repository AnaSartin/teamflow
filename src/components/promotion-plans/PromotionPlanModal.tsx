'use client'

import { useState, useTransition } from 'react'
import { createPromotionPlan, applyPromotionPlan, cancelPromotionPlan } from '@/app/actions/promotion-plans'
import { fmtCurrency } from '@/lib/utils'
import type { PromotionPlan } from '@/types'

const MACRO_SUGGESTIONS = [
  { value: 'junior', label: 'Júnior' },
  { value: 'pleno', label: 'Pleno' },
  { value: 'senior', label: 'Sênior' },
  { value: 'especialista', label: 'Especialista' },
  { value: 'coordenador', label: 'Coordenador' },
  { value: 'gerente', label: 'Gerente' },
]

// ─── Create Plan Modal ────────────────────────────────────────────────────────

export function CreatePromotionPlanModal({
  collaboratorId,
  collaboratorName,
  currentSalary,
}: {
  collaboratorId: string
  collaboratorName: string
  currentSalary: number
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [macroRole, setMacroRole] = useState('')
  const [gridLevel, setGridLevel] = useState(1)
  const [newSalary, setNewSalary] = useState(currentSalary)

  const pctIncrease = newSalary > currentSalary
    ? Math.round(((newSalary - currentSalary) / currentSalary) * 100)
    : 0

  const today = new Date()
  const minDate = new Date(today)
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createPromotionPlan({
        collaborator_id: collaboratorId,
        collaborator_name: collaboratorName,
        new_macro_role: macroRole,
        new_grid_level: gridLevel,
        new_salary: newSalary,
        effective_date: fd.get('effective_date') as string,
        notes: fd.get('notes') as string,
      })
      if (result?.error) setError(result.error)
      else setOpen(false)
    })
  }

  const inputCls = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'

  return (
    <>
      <button
        onClick={() => { setOpen(true); setError('') }}
        className="text-xs border border-purple-200 text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg font-medium transition-colors"
      >
        + Planejar promoção
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-800 mb-1">Planejar promoção futura</h3>
            <p className="text-sm text-slate-500 mb-4">{collaboratorName}</p>

            <div className="bg-slate-50 rounded-lg px-3 py-2 mb-4 text-xs text-slate-500">
              Salário atual: <span className="font-semibold text-slate-700">{fmtCurrency(currentSalary)}</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Cargo de destino *</label>
                  <select
                    value={macroRole}
                    onChange={e => setMacroRole(e.target.value)}
                    required
                    className={inputCls}
                  >
                    <option value="">Selecione...</option>
                    {MACRO_SUGGESTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nível *</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={gridLevel}
                    onChange={e => setGridLevel(parseInt(e.target.value) || 1)}
                    required
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Salário previsto (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={newSalary}
                  onChange={e => setNewSalary(parseFloat(e.target.value) || 0)}
                  className={inputCls}
                />
                {pctIncrease > 0 && (
                  <p className="text-xs text-emerald-600 mt-1">+{pctIncrease}% de aumento em relação ao atual</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Data de vigência *</label>
                <input
                  name="effective_date"
                  type="date"
                  min={minDateStr}
                  required
                  className={inputCls}
                />
                <p className="text-xs text-slate-400 mt-1">Quando esta promoção entrará em vigor.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Observações</label>
                <input name="notes" type="text" className={inputCls} placeholder="Motivo, contexto..." />
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="text-sm px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Cancelar</button>
                <button type="submit" disabled={isPending} className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-60">
                  {isPending ? 'Salvando...' : 'Criar plano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Apply/Cancel buttons (inline on card) ────────────────────────────────────

export function ApplyPlanButton({
  plan,
  collaboratorName,
}: {
  plan: PromotionPlan
  collaboratorName: string
}) {
  const [confirm, setConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleApply() {
    startTransition(async () => {
      const result = await applyPromotionPlan(plan.id, collaboratorName)
      if (result?.error) { setError(result.error); setConfirm(false) }
    })
  }

  if (error) return (
    <p className="text-xs text-red-600">{error} <button onClick={() => setError('')} className="underline">OK</button></p>
  )

  if (!confirm) return (
    <button
      onClick={() => setConfirm(true)}
      className="text-xs border border-emerald-200 text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded transition-colors"
    >
      Aplicar agora
    </button>
  )

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-slate-500">Confirmar promoção?</span>
      <button onClick={() => setConfirm(false)} className="text-xs px-2 py-1 border border-slate-300 rounded hover:bg-slate-50">Não</button>
      <button onClick={handleApply} disabled={isPending} className="text-xs bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700 disabled:opacity-60">
        {isPending ? '...' : 'Sim'}
      </button>
    </div>
  )
}

export function CancelPlanButton({
  planId,
  collaboratorName,
}: {
  planId: string
  collaboratorName: string
}) {
  const [confirm, setConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelPromotionPlan(planId, collaboratorName)
      if (result?.error) { setError(result.error); setConfirm(false) }
    })
  }

  if (error) return (
    <p className="text-xs text-red-600">{error} <button onClick={() => setError('')} className="underline">OK</button></p>
  )

  if (!confirm) return (
    <button
      onClick={() => setConfirm(true)}
      className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
    >
      Cancelar plano
    </button>
  )

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-slate-500">Confirmar cancelamento?</span>
      <button onClick={() => setConfirm(false)} className="text-xs px-2 py-1 border border-slate-300 rounded hover:bg-slate-50">Não</button>
      <button onClick={handleCancel} disabled={isPending} className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-60">
        {isPending ? '...' : 'Sim'}
      </button>
    </div>
  )
}
