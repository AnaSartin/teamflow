'use client'

import { useState, useTransition } from 'react'
import { createVacationPeriod } from '@/app/actions/vacations'

interface CollaboratorOption {
  id: string
  name: string
  team: string
}

export default function NewVacationPeriodModal({ collaborators }: { collaborators: CollaboratorOption[] }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        const collaborator_id = fd.get('collaborator_id') as string
        const collaborator_name = collaborators.find(c => c.id === collaborator_id)?.name ?? collaborator_id
        await createVacationPeriod({
          collaborator_id,
          collaborator_name,
          acquisition_start: fd.get('acquisition_start') as string,
        })
        setSuccess(true)
        setTimeout(() => { setOpen(false); setSuccess(false) }, 1500)
      } catch (err) {
        setError(String(err))
      }
    })
  }

  const inputCls = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
      >
        + Novo período
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Registrar período aquisitivo</h3>
            {success ? (
              <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                ✓ Período registrado com sucesso!
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Colaborador *</label>
                  <select name="collaborator_id" required className={inputCls}>
                    <option value="">Selecione...</option>
                    {collaborators.map(c => (
                      <option key={c.id} value={c.id}>{c.name} — {c.team}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Início do período aquisitivo *</label>
                  <input name="acquisition_start" type="date" required className={inputCls} />
                  <p className="text-xs text-slate-400 mt-1">
                    Vencimento será calculado automaticamente (2 anos após o início).
                  </p>
                </div>

                {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>}

                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setOpen(false)} className="text-sm px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isPending} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60">
                    {isPending ? 'Salvando...' : 'Registrar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
