'use client'

import { useState, useTransition } from 'react'
import { deleteGridPosition } from '@/app/actions/grid'

export default function GridDeleteButton({ id, title }: { id: string; title: string }) {
  const [confirm, setConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleDelete() {
    setError('')
    startTransition(async () => {
      const result = await deleteGridPosition(id)
      if (result?.error) {
        setError(result.error)
        setConfirm(false)
      }
    })
  }

  if (error) {
    return (
      <div className="flex items-start gap-2 max-w-xs">
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-2 py-1 flex-1">{error}</p>
        <button onClick={() => setError('')} className="text-xs text-slate-400 hover:text-slate-600 shrink-0">✕</button>
      </div>
    )
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors font-medium"
        title={`Excluir ${title}`}
      >
        Excluir
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-slate-500">Confirmar?</span>
      <button
        onClick={() => setConfirm(false)}
        className="text-xs px-2 py-1 border border-slate-300 rounded hover:bg-slate-50"
      >
        Não
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-60"
      >
        {isPending ? '...' : 'Sim'}
      </button>
    </div>
  )
}
