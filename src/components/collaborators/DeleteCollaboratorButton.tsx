'use client'

import { useState, useTransition } from 'react'
import { deleteCollaborator } from '@/app/actions/collaborators'

export default function DeleteCollaboratorButton({ id, name }: { id: string; name: string }) {
  const [confirm, setConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteCollaborator(id)
      } catch (err) {
        setError(String(err))
        setConfirm(false)
      }
    })
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="text-sm border border-red-200 text-red-600 hover:bg-red-50 px-3.5 py-1.5 rounded-lg transition-colors"
      >
        Excluir
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <span className="text-xs text-slate-500">Excluir {name}?</span>
      <button
        onClick={() => setConfirm(false)}
        className="text-sm px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50"
      >
        Cancelar
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-sm bg-red-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-60"
      >
        {isPending ? 'Excluindo...' : 'Confirmar'}
      </button>
    </div>
  )
}
