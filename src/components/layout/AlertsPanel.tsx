'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import Link from 'next/link'

export interface AlertItem {
  id: string
  name: string
  type: 'vacation_expired' | 'vacation_expiring' | 'no_promotion' | 'anniversary'
  detail: string
  priority: 'critical' | 'high' | 'medium'
}

const TYPE_LABELS: Record<AlertItem['type'], string> = {
  vacation_expired:  'Férias vencidas',
  vacation_expiring: 'Férias vencendo',
  no_promotion:      'Sem promoção',
  anniversary:       'Aniversário',
}

const PRIORITY_STYLES: Record<AlertItem['priority'], { badge: string; icon: string }> = {
  critical: { badge: 'bg-red-100 text-red-700',    icon: '🔴' },
  high:     { badge: 'bg-amber-100 text-amber-700', icon: '🟡' },
  medium:   { badge: 'bg-blue-100 text-blue-700',   icon: '🔵' },
}

export default function AlertsPanel({ alerts }: { alerts: AlertItem[] }) {
  const [open, setOpen] = useState(false)

  const criticalCount = alerts.filter(a => a.priority === 'critical').length
  const totalCount = alerts.length

  const badgeColor = criticalCount > 0
    ? 'bg-red-500'
    : totalCount > 0
    ? 'bg-amber-500'
    : 'bg-slate-400'

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors relative"
        title="Alertas"
      >
        <Bell className="w-4 h-4" />
        {totalCount > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 ${badgeColor} text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none`}>
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Alertas ativos</h3>
              {criticalCount > 0 && (
                <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  {criticalCount} crítico{criticalCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {alerts.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-xl mb-1">✓</p>
                <p className="text-sm text-slate-500">Nenhum alerta ativo</p>
              </div>
            ) : (
              <>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {alerts.slice(0, 10).map((a, i) => {
                    const s = PRIORITY_STYLES[a.priority]
                    return (
                      <Link
                        key={i}
                        href={`/collaborators/${a.id}`}
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                      >
                        <span className="text-base shrink-0 mt-0.5">{s.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{a.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{a.detail}</p>
                        </div>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${s.badge}`}>
                          {TYPE_LABELS[a.type]}
                        </span>
                      </Link>
                    )
                  })}
                </div>
                {alerts.length > 10 && (
                  <div className="px-4 py-2 text-xs text-slate-400 text-center border-t border-slate-100">
                    + {alerts.length - 10} alerta(s) adicionais
                  </div>
                )}
                <div className="px-4 py-3 border-t border-slate-100">
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="block text-center text-xs text-blue-600 hover:underline font-medium"
                  >
                    Ver painel completo →
                  </Link>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
