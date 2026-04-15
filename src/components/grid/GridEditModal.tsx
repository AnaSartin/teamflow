'use client'

import { useState, useTransition } from 'react'
import { updateGridPosition } from '@/app/actions/grid'
import { fmtCurrency } from '@/lib/utils'

interface GridRow {
  id: string
  full_title: string
  salary_min: number
  salary_max: number
  notes: string | null
}

export default function GridEditModal({ row }: { row: GridRow }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    const salary_min = parseFloat(fd.get('salary_min') as string)
    const salary_max = parseFloat(fd.get('salary_max') as string)
    const notes = fd.get('notes') as string

    startTransition(async () => {
      try {
        await updateGridPosition(row.id, { salary_min, salary_max, notes })
        setOpen(false)
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
        className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
      >
        Editar
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-800 mb-1">Editar faixa salarial</h3>
            <p className="text-sm text-slate-500 mb-4">{row.full_title}</p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Mínimo (R$) <span className="text-slate-400">atual: {fmtCurrency(row.salary_min)}</span>
                  </label>
                  <input
                    name="salary_min"
                    type="number"
                    step="100"
                    min="1"
                    required
                    defaultValue={row.salary_min}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Máximo (R$) <span className="text-slate-400">atual: {fmtCurrency(row.salary_max)}</span>
                  </label>
                  <input
                    name="salary_max"
                    type="number"
                    step="100"
                    min="1"
                    required
                    defaultValue={row.salary_max}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Observação</label>
                <input
                  name="notes"
                  type="text"
                  defaultValue={row.notes ?? ''}
                  className={inputCls}
                  placeholder="Observação opcional..."
                />
              </div>

              {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>}

              <div className="flex justify-end gap-2 pt-1">
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
                  {isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
