import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SectionHeader, StatCard, Badge, Avatar, AlertBanner } from '@/components/ui'
import { fmtDate, fmtCurrency, MACRO_LABELS } from '@/lib/utils'
import {
  differenceInDays,
  differenceInMonths,
  parseISO,
  addYears,
  format,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function DashboardPage() {
  const supabase = await createClient()
  const today = new Date()

  const { data: collaborators } = await supabase
    .from('collaborators')
    .select('*, vacations(*)')
    .neq('status', 'terminated')
    .order('name')

  const all = collaborators ?? []

  // ── Metrics ─────────────────────────────────────────────────────────────
  const byMacro = { junior: 0, pleno: 0, senior: 0 }
  let onVacation = 0
  let vacExpiredCount = 0
  let vacExpiringCount = 0
  let noPromoCount = 0

  const urgentRows: Array<{ id: string; name: string; team: string; alert: string; alertType: 'red' | 'amber' }> = []
  const upcomingVacations: Array<{ id: string; name: string; start: string; end: string; expiry: string; daysLeft: number }> = []

  for (const c of all) {
    byMacro[c.macro_role as keyof typeof byMacro]++
    if (c.status === 'vacation') onVacation++

    // Vacation expiry check
    const vacations: Array<Record<string, string>> = c.vacations ?? []
    for (const v of vacations) {
      if (v.status === 'completed') continue
      const days = differenceInDays(parseISO(v.expiry_date), today)
      if (days < 0) {
        vacExpiredCount++
        urgentRows.push({ id: c.id, name: c.name, team: c.team, alert: `Férias vencidas há ${Math.abs(days)}d`, alertType: 'red' })
      } else if (days <= 90) {
        vacExpiringCount++
        urgentRows.push({ id: c.id, name: c.name, team: c.team, alert: `Férias vencem em ${days}d`, alertType: 'amber' })
      }
      if (v.scheduled_start && v.status === 'scheduled') {
        upcomingVacations.push({
          id: c.id,
          name: c.name,
          start: v.scheduled_start,
          end: v.scheduled_end,
          expiry: v.expiry_date,
          daysLeft: days,
        })
      }
    }

    // No promotion check
    const lastPromo = c.last_promotion_date || c.admission_date
    const monthsSincePromo = differenceInMonths(today, parseISO(lastPromo))
    if (monthsSincePromo >= 18) {
      noPromoCount++
      if (!urgentRows.find(r => r.id === c.id && r.alert.includes('promoção'))) {
        urgentRows.push({ id: c.id, name: c.name, team: c.team, alert: `Sem promoção há ${monthsSincePromo}m`, alertType: 'amber' })
      }
    }
  }

  upcomingVacations.sort((a, b) => a.start.localeCompare(b.start))

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <SectionHeader
        title="Dashboard"
        description={`Visão executiva da equipe · ${format(today, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`}
      />

      {vacExpiredCount > 0 && (
        <AlertBanner type="error">
          <strong>{vacExpiredCount} colaborador(es)</strong> com férias vencidas e não agendadas. Ação imediata necessária.
        </AlertBanner>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total ativo" value={all.length} sub="colaboradores" accent="blue" />
        <StatCard label="Em férias" value={onVacation} sub="agora" />
        <StatCard label="Férias vencidas" value={vacExpiredCount} accent={vacExpiredCount > 0 ? 'red' : undefined} />
        <StatCard label="Vencendo em 90d" value={vacExpiringCount} accent={vacExpiringCount > 0 ? 'amber' : undefined} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Júniores" value={byMacro.junior} sub="J1–J4" />
        <StatCard label="Plenos" value={byMacro.pleno} sub="P1–P4" />
        <StatCard label="Sêniores" value={byMacro.senior} sub="S1–S4" />
        <StatCard label="Sem promoção +18m" value={noPromoCount} accent={noPromoCount > 0 ? 'amber' : undefined} />
      </div>

      {/* Two-column tables */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Urgent */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">⚠ Pendências urgentes</h2>
            <span className="text-xs text-slate-400">{urgentRows.length} item(s)</span>
          </div>
          <div className="divide-y divide-slate-100">
            {urgentRows.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">Nenhuma pendência urgente</p>
            )}
            {urgentRows.slice(0, 8).map((r, i) => (
              <Link key={i} href={`/collaborators/${r.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                <Avatar name={r.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{r.name}</p>
                  <p className="text-xs text-slate-400">{r.team}</p>
                </div>
                <Badge variant={r.alertType}>{r.alert}</Badge>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming vacations */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">📅 Próximas férias agendadas</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {upcomingVacations.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">Nenhuma férias agendada</p>
            )}
            {upcomingVacations.slice(0, 8).map((v, i) => (
              <Link key={i} href={`/collaborators/${v.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                <Avatar name={v.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{v.name}</p>
                  <p className="text-xs text-slate-400">{fmtDate(v.start)} → {fmtDate(v.end)}</p>
                </div>
                <Badge variant={v.daysLeft < 90 ? 'amber' : 'gray'}>{fmtDate(v.expiry)}</Badge>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
