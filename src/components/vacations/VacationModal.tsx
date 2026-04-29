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

const DURATION_OPTIONS = [
  { days: 10, label: '10 dias' },
  { days: 20, label: '20 dias' },
  { days: 30, label: '30 dias (completo)' },
]

function addDaysToDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function formatDateBR(dateStr: string): string {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
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

  const [startDate, setStartDate] = useState(vacation.scheduled_start ?? '')
  const [duration, setDuration] = useState(30)

  // Calculate end date (return to work = start + duration days)
  const scheduledEnd = startDate ? addDaysToDate(startDate, duration) : ''
  // Last day of vacation = scheduled_end - 1
  const lastVacationDay = startDate ? addDaysToDate(startDate, duration - 1) : ''

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!startDate) { setError('Selecione a data de início das férias.'); return }
    if (!scheduledEnd) { setError('Erro ao calcular a data de retorno.'); return }

    startTransition(async () => {
      const result = await scheduleVacation({
        collaborator_id: collaborator.id,
        collaborator_name: collaborator.name,
        acquisition_start: vacation.acquisition_start,
        acquisition_end: vacation.acquisition_end,
        expiry_date: vacation.expiry_date,
        scheduled_start: startDate,
        scheduled_end: scheduledEnd,
        notes: (e.currentTarget.elements.namedItem('notes') as HTMLInputElement)?.value || undefined,
      })
      if (result?.error) setError(result.error)
      else setOpen(false)
    })
  }

  function handleComplete() {
    startTransition(async () => {
      const result = await completeVacation(vacation.id, collaborator.id, collaborator.name)
      if (result?.error) setError(result.error)
      else setOpen(false)
    })
  }

  const inputCls = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      <button
        onClick={() => { setOpen(true); setError('') }}
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

            {/* Período aquisitivo info */}
            <div className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2 mb-4 space-y-0.5">
              <p>Período aquisitivo: {fmtDate(vacation.acquisition_start)} → {fmtDate(vacation.acquisition_end)}</p>
              <p>Vencimento: <span className="font-medium text-amber-600">{fmtDate(vacation.expiry_date)}</span></p>
              {vacation.scheduled_start && (
                <p>Agendamento atual: {fmtDate(vacation.scheduled_start)} → {fmtDate(vacation.scheduled_end)}</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Início */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Data de início *</label>
                <input
                  type="date"
                  required
                  min={today}
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Duração */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Duração das férias *</label>
                <div className="grid grid-cols-3 gap-2">
                  {DURATION_OPTIONS.map(opt => (
                    <button
                      key={opt.days}
                      type="button"
                      onClick={() => setDuration(opt.days)}
                      className={`py-2 px-3 text-sm rounded-lg border font-medium transition-colors ${
                        duration === opt.days
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resultado calculado */}
              {startDate && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 space-y-1">
                  <p className="text-xs font-medium text-blue-700">Resumo calculado automaticamente</p>
                  <div className="grid grid-cols-2 gap-x-4 text-xs text-slate-600 mt-1">
                    <span className="text-slate-500">Início:</span>
                    <span className="font-medium">{formatDateBR(startDate)}</span>
                    <span className="text-slate-500">Último dia de férias:</span>
                    <span className="font-medium">{formatDateBR(lastVacationDay)}</span>
                    <span className="text-slate-500">Retorno ao trabalho:</span>
                    <span className="font-medium text-emerald-700">{formatDateBR(scheduledEnd)}</span>
                    <span className="text-slate-500">Total:</span>
                    <span className="font-medium">{duration} dias</span>
                  </div>
                </div>
              )}

              {/* Observações */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Observações</label>
                <input name="notes" type="text" className={inputCls} placeholder="Informação adicional..." />
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>
              )}

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
                    disabled={isPending || !startDate}
                    className="text-sm bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-60"
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
