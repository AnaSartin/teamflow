'use client'

import { useState, useTransition } from 'react'
import { scheduleVacation, completeVacation } from '@/app/actions/vacations'
import { fmtDate } from '@/lib/utils'

interface VacationRecord {
  id: string
  collaborator_id: string
  acquisition_start: string
  acquisition_end: string
  expiry_date: string
  scheduled_start: string | null
  scheduled_end: string | null
  status: string
}

interface CollaboratorRef {
  id: string
  name: string
}

export default function VacationModal({
  vacation,
  collaborator,
}: {
  vacation: VacationRecord
  collaborator: CollaboratorRef
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await scheduleVacation({
          collaborator_id: collaborator.id,
          acquisition_start: vacation.acquisition_start,
          acquisition_end: vacation.acquisition_end,
          expiry_date: vacation.expiry_date,
          scheduled_start: fd.get('scheduled_start') as string,
          scheduled_end: fd.get('scheduled_end') as string,
          notes: fd.get('notes') as string || undefined,
        })
        setOpen(false)
      } catch (err) {
        setError(String(err))
      }
    })
  }

  function handleComplete() {
    startTransition(async () => {
      try {
        await completeVacation(vacation.id, collaborator.id)
        setOpen(false)
      } catch (err) {
        setError(String(err))
      }
    })
  }

  const inputCls = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs border border-blue-200 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-md font-medium transition-colors"
      >
        {vacation.scheduled_start ? 'Reagendar' : 'Agendar'}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-800 mb-1">Agendar férias</h3>
            <p className="text-sm text-slate-500 mb-1">{collaborator.name}</p>
            <div className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2 mb-4 space-y-0.5">
              <p>Período aquisitivo: {fmtDate(vacation.acquisition_start)} → {fmtDate(vacation.acquisition_end)}</p>
              <p>Vencimento: <span className="font-medium text-amber-600">{fmtDate(vacation.expiry_date)}</span></p>
              {vacation.scheduled_start && (
                <p>Agendado atualmente: {fmtDate(vacation.scheduled_start)} → {fmtDate(vacation.scheduled_end)}</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Início das férias *</label>
                  <input
                    name="scheduled_start"
                    type="date"
                    required
                    min={today}
                    defaultValue={vacation.scheduled_start ?? today}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Retorno *</label>
                  <input
                    name="scheduled_end"
                    type="date"
                    required
                    min={today}
                    defaultValue={vacation.scheduled_end ?? ''}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Observações</label>
                <input name="notes" type="text" className={inputCls} placeholder="Informação adicional..." />
              </div>

              {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>}

              <div className="flex items-center justify-between gap-2 pt-1">
                <div>
                  {vacation.scheduled_start && vacation.status !== 'completed' && (
                    <button
                      type="button"
                      onClick={handleComplete}
                      disabled={isPending}
                      className="text-xs border border-emerald-200 text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg disabled:opacity-50"
                    >
                      Marcar concluída
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-sm px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                  >
                    {isPending ? 'Salvando...' : 'Confirmar'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
