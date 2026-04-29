'use client'

import { useState, useTransition } from 'react'
import { createTeam, updateTeam, deleteTeam } from '@/app/actions/teams'
import type { Team } from '@/types'

const TYPE_OPTS = [
  { value: '', label: 'Sem tipo' },
  { value: 'suporte', label: 'Suporte' },
  { value: 'coordenacao', label: 'Coordenação' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'operacoes', label: 'Operações' },
  { value: 'ti', label: 'Tecnologia' },
  { value: 'rh', label: 'Recursos Humanos' },
]

// ─── Create modal ─────────────────────────────────────────────────────────────

export function TeamCreateModal() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createTeam({
        name: fd.get('name') as string,
        type: fd.get('type') as string,
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
        className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
      >
        + Nova equipe
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Nova equipe</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nome da equipe *</label>
                <input name="name" required placeholder="Ex: RZ, Petros, Cibus..." className={inputCls} autoFocus />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tipo</label>
                <select name="type" className={inputCls}>
                  {TYPE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="text-sm px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Cancelar</button>
                <button type="submit" disabled={isPending} className="text-sm bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-60">
                  {isPending ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

export function TeamEditModal({ team }: { team: Team }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateTeam(team.id, {
        name: fd.get('name') as string,
        type: fd.get('type') as string,
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
        className="text-xs border border-slate-300 text-slate-600 hover:bg-slate-50 px-2 py-1 rounded-md transition-colors"
      >
        Editar
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Editar equipe</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nome da equipe *</label>
                <input name="name" required defaultValue={team.name} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tipo</label>
                <select name="type" defaultValue={team.type ?? ''} className={inputCls}>
                  {TYPE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="text-sm px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Cancelar</button>
                <button type="submit" disabled={isPending} className="text-sm bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-60">
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

// ─── Delete button ────────────────────────────────────────────────────────────

export function TeamDeleteButton({ id, name }: { id: string; name: string }) {
  const [confirm, setConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteTeam(id)
      if (result?.error) { setError(result.error); setConfirm(false) }
    })
  }

  if (error) {
    return (
      <div className="flex items-start gap-2 max-w-xs">
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-2 py-1 flex-1">{error}</p>
        <button onClick={() => setError('')} className="text-xs text-slate-400 hover:text-slate-600">✕</button>
      </div>
    )
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
        title={`Excluir ${name}`}
      >
        Excluir
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-slate-500">Confirmar?</span>
      <button onClick={() => setConfirm(false)} className="text-xs px-2 py-1 border border-slate-300 rounded hover:bg-slate-50">Não</button>
      <button onClick={handleDelete} disabled={isPending} className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-60">
        {isPending ? '...' : 'Sim'}
      </button>
    </div>
  )
}
