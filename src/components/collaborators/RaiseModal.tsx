'use client'

import { useState, useTransition } from 'react'
import { registerRaise } from '@/app/actions/collaborators'
import { fmtCurrency } from '@/lib/utils'
import type { Collaborator } from '@/types'

export default function RaiseModal({ collaborator }: { collaborator: Collaborator }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await registerRaise({
          collaborator_id: collaborator.id,
          salary_before: collaborator.current_salary,
          salary_after: parseFloat(fd.get('salary_after') as string),
          event_date: fd.get('event_date') as string,
          reason: fd.get('reason') as string,
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
      <button onClick={() => setOpen(true)} className="text-xs border border-emerald-200 text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg font-medium transition-colors">
        + Reajuste salarial
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Registrar reajuste salarial</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Salário atual</label>
                <input value={fmtCurrency(collaborator.current_salary)} readOnly className={`${inputCls} bg-slate-50`} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Novo salário *</label>
                <input name="salary_after" type="number" step="0.01" required defaultValue={collaborator.current_salary} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Data *</label>
                <input name="event_date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Motivo *</label>
                <input name="reason" required className={inputCls} placeholder="Reajuste anual / INPC / Mérito..." />
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="text-sm px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Cancelar</button>
                <button type="submit" disabled={isPending} className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-60">
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
