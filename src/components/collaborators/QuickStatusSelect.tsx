'use client'

import { useTransition } from 'react'
import { updateCollaboratorStatus } from '@/app/actions/collaborators'
import type { CollaboratorStatus } from '@/types'

const STATUS_OPTIONS: { value: CollaboratorStatus; label: string }[] = [
  { value: 'active', label: 'Ativo' },
  { value: 'vacation', label: 'Férias' },
  { value: 'leave', label: 'Afastado' },
  { value: 'terminated', label: 'Desligado' },
]

const STATUS_COLORS: Record<CollaboratorStatus, string> = {
  active:     'text-emerald-700 bg-emerald-50 border-emerald-200',
  vacation:   'text-blue-700 bg-blue-50 border-blue-200',
  leave:      'text-amber-700 bg-amber-50 border-amber-200',
  terminated: 'text-red-700 bg-red-50 border-red-200',
}

export default function QuickStatusSelect({
  id,
  currentStatus,
}: {
  id: string
  currentStatus: CollaboratorStatus
}) {
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as CollaboratorStatus
    startTransition(() => {
      updateCollaboratorStatus(id, newStatus)
    })
  }

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className={`text-xs font-medium border rounded-full px-2 py-0.5 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400 transition-opacity ${STATUS_COLORS[currentStatus]} ${isPending ? 'opacity-50' : ''}`}
    >
      {STATUS_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}
