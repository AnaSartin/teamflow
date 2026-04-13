'use client'

import { useState, useTransition } from 'react'
import { registerPromotion } from '@/app/actions/collaborators'
import { buildTitle, MACRO_LABELS } from '@/lib/utils'
import type { Collaborator, MacroRole, GridLevel } from '@/types'

export default function PromotionModal({ collaborator }: { collaborator: Collaborator }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [newMacro, setNewMacro] = useState<MacroRole>(collaborator.macro_role)
  const [newLevel, setNewLevel] = useState<GridLevel>(collaborator.grid_level)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await registerPromotion({
          collaborator_id: collaborator.id,
          previous_macro_role: collaborator.macro_role,
          previous_level: collaborator.grid_level,
          new_macro_role: newMacro,
          new_level: newLevel,
          salary_before: collaborator.current_salary,
          salary_after: parseFloat(fd.get('salary_after') as string),
          event_date: fd.get('event_date') as string,
          notes: fd.get('notes') as string,
        })
        setOpen(false)
      } catch (err) {
        setError(String(err))
      }
    })
  }

  const inputCls = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs border border-blue-200 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-medium transition-colors">
        + Registrar promoção
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Registrar promoção</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-2">Posição atual: <strong>{buildTitle(collaborator.macro_role, collaborator.grid_level)}</strong></p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Novo cargo macro</label>
                  <select value={newMacro} onChange={e => setNewMacro(e.target.value as MacroRole)} className={inputCls}>
                    {Object.entries(MACRO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Novo nível</label>
                  <select value={newLevel} onChange={e => setNewLevel(parseInt(e.target.value) as GridLevel)} className={inputCls}>
                    {[1, 2, 3, 4].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Novo cargo</label>
                <input value={buildTitle(newMacro, newLevel)} readOnly className={`${inputCls} bg-slate-50`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Salário anterior</label>
                  <input value={collaborator.current_salary} readOnly className={`${inputCls} bg-slate-50`} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Novo salário *</label>
                  <input name="salary_after" type="number" step="0.01" required defaultValue={collaborator.current_salary} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Data da promoção *</label>
                <input name="event_date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Observações</label>
                <textarea name="notes" rows={2} className={inputCls} placeholder="Motivo ou contexto..." />
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="text-sm px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Cancelar</button>
                <button type="submit" disabled={isPending} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60">
                  {isPending ? 'Salvando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
