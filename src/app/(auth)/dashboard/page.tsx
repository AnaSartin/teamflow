import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { fmtDate, fmtCurrency, MACRO_LABELS } from '@/lib/utils'
import {
  differenceInDays,
  differenceInMonths,
  parseISO,
  addYears,
  format,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Avatar, Badge } from '@/components/ui'
import type { MacroRole, GridLevel } from '@/types'

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, accent, href,
}: {
  label: string
  value: string | number
  sub?: string
  accent?: 'blue' | 'red' | 'amber' | 'green' | 'purple'
  href?: string
}) {
  const accentBorder = {
    blue:   'border-l-blue-500   bg-blue-50',
    red:    'border-l-red-500    bg-red-50',
    amber:  'border-l-amber-500  bg-amber-50',
    green:  'border-l-emerald-500 bg-emerald-50',
    purple: 'border-l-purple-500 bg-purple-50',
  }
  const accentText = {
    blue:   'text-blue-700',
    red:    'text-red-700',
    amber:  'text-amber-700',
    green:  'text-emerald-700',
    purple: 'text-purple-700',
  }

  const inner = (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 h-full ${accent ? `border-l-4 ${accentBorder[accent]}` : ''}`}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">{label}</p>
      <p className={`text-2xl font-bold tracking-tight ${accent ? accentText[accent] : 'text-slate-900'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
  return href ? <Link href={href} className="block h-full hover:opacity-90 transition-opacity">{inner}</Link> : inner
}

function LevelBar({
  macro, level, count, total, maxCount,
}: {
  macro: MacroRole; level: GridLevel; count: number; total: number; maxCount: number
}) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
  const barColor = { junior: 'bg-amber-400', pleno: 'bg-blue-500', senior: 'bg-purple-500' }[macro]
  const label = `${macro[0].toUpperCase()}${level}`

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono font-semibold text-slate-500 w-6 shrink-0">{label}</span>
      <div className="flex-1 h-5 bg-slate-100 rounded overflow-hidden">
        <div
          className={`h-full ${barColor} rounded transition-all flex items-center pl-1.5`}
          style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
        >
          {count > 0 && <span className="text-[10px] font-bold text-white">{count}</span>}
        </div>
      </div>
      <span className="text-xs text-slate-400 w-12 text-right shrink-0">
        {total > 0 ? `${Math.round((count / total) * 100)}%` : '0%'}
      </span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient()
  const today = new Date()

  // Single comprehensive query
  const { data: collaborators } = await supabase
    .from('collaborators')
    .select('*, vacations(*)')
    .neq('status', 'terminated')
    .order('name')

  const all = collaborators ?? []
  const active = all.filter(c => c.status === 'active')
  const onVacation = all.filter(c => c.status === 'vacation').length
  const onLeave    = all.filter(c => c.status === 'leave').length

  // ── By macro + level ─────────────────────────────────────────────────────
  type MacroKey = 'junior' | 'pleno' | 'senior'
  const byMacro: Record<MacroKey, number> = { junior: 0, pleno: 0, senior: 0 }
  const byLevel: Record<string, number> = {}
  for (const c of all) {
    byMacro[c.macro_role as MacroKey]++
    const key = `${c.macro_role}-${c.grid_level}`
    byLevel[key] = (byLevel[key] ?? 0) + 1
  }

  // ── Salary stats ─────────────────────────────────────────────────────────
  const salaryByMacro: Record<MacroKey, { total: number; count: number; min: number; max: number }> = {
    junior: { total: 0, count: 0, min: Infinity, max: 0 },
    pleno:  { total: 0, count: 0, min: Infinity, max: 0 },
    senior: { total: 0, count: 0, min: Infinity, max: 0 },
  }
  for (const c of all) {
    const s = salaryByMacro[c.macro_role as MacroKey]
    s.total += c.current_salary
    s.count++
    if (c.current_salary < s.min) s.min = c.current_salary
    if (c.current_salary > s.max) s.max = c.current_salary
  }

  // ── Promotion metrics ────────────────────────────────────────────────────
  let totalPromoMonths = 0
  let noPromoCount = 0
  const urgentAlerts: Array<{
    id: string; name: string; team: string; macro_role: string
    alert: string; detail: string; priority: 'critical' | 'high' | 'medium'
  }> = []

  // ── Vacation metrics ─────────────────────────────────────────────────────
  let vacExpiredCount   = 0
  let vacExpiringCount  = 0
  let vacNotScheduledUrgent = 0

  // ── Upcoming vacations ───────────────────────────────────────────────────
  const upcomingVacations: Array<{
    id: string; name: string; start: string; end: string | null; daysLeft: number
  }> = []

  // ── Anniversaries in 30 days ─────────────────────────────────────────────
  const anniversaries: Array<{
    id: string; name: string; team: string; years: number; date: string
  }> = []

  for (const c of all) {
    // Promotion
    const lastPromo = c.last_promotion_date || c.admission_date
    const months = differenceInMonths(today, parseISO(lastPromo))
    totalPromoMonths += months
    if (months >= 18) {
      noPromoCount++
      urgentAlerts.push({
        id: c.id, name: c.name, team: c.team, macro_role: c.macro_role,
        alert: 'Sem promoção',
        detail: `${months}m sem promoção`,
        priority: months >= 24 ? 'critical' : 'high',
      })
    }

    // Vacations
    const vacList: Array<Record<string, string>> = c.vacations ?? []
    for (const v of vacList) {
      if (v.status === 'completed') continue
      const days = differenceInDays(parseISO(v.expiry_date), today)
      if (days < 0) {
        vacExpiredCount++
        urgentAlerts.push({
          id: c.id, name: c.name, team: c.team, macro_role: c.macro_role,
          alert: 'Férias vencidas',
          detail: `${Math.abs(days)}d vencidas`,
          priority: 'critical',
        })
      } else if (days <= 30) {
        vacExpiringCount++
        urgentAlerts.push({
          id: c.id, name: c.name, team: c.team, macro_role: c.macro_role,
          alert: 'Férias vencendo',
          detail: `${days}d restantes`,
          priority: 'high',
        })
      } else if (days <= 90) {
        vacExpiringCount++
        urgentAlerts.push({
          id: c.id, name: c.name, team: c.team, macro_role: c.macro_role,
          alert: 'Vence em 90d',
          detail: `${days}d restantes`,
          priority: 'medium',
        })
      }
      if (!v.scheduled_start && days <= 120) vacNotScheduledUrgent++
      if (v.scheduled_start && (v.status === 'scheduled' || v.status === 'ongoing')) {
        upcomingVacations.push({
          id: c.id, name: c.name,
          start: v.scheduled_start,
          end: v.scheduled_end || null,
          daysLeft: days,
        })
      }
    }

    // Anniversary
    const adm = parseISO(c.admission_date)
    const years = Math.floor(differenceInMonths(today, adm) / 12)
    const nextAnniv = addYears(adm, years + 1)
    const daysUntilAnniv = differenceInDays(nextAnniv, today)
    if (daysUntilAnniv >= 0 && daysUntilAnniv <= 30) {
      anniversaries.push({
        id: c.id, name: c.name, team: c.team,
        years: years + 1,
        date: format(nextAnniv, 'dd/MM', { locale: ptBR }),
      })
    }
  }

  const avgPromoMonths = all.length > 0 ? Math.round(totalPromoMonths / all.length) : 0
  const avgSalaryAll = all.length > 0
    ? all.reduce((s, c) => s + c.current_salary, 0) / all.length
    : 0

  // Sort alerts: critical first
  urgentAlerts.sort((a, b) => {
    const p = { critical: 0, high: 1, medium: 2 }
    return p[a.priority] - p[b.priority]
  })

  // Upcoming sorted by start date
  upcomingVacations.sort((a, b) => a.start.localeCompare(b.start))

  const maxLevelCount = Math.max(...(['junior', 'pleno', 'senior'] as MacroKey[]).flatMap(m =>
    [1, 2, 3, 4].map(l => byLevel[`${m}-${l}`] ?? 0)
  ), 1)

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {format(today, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        {urgentAlerts.filter(a => a.priority === 'critical').length > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
            <span className="text-sm font-medium text-red-700">
              {urgentAlerts.filter(a => a.priority === 'critical').length} pendência(s) crítica(s)
            </span>
          </div>
        )}
      </div>

      {/* ── KPI row 1: headcount ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard label="Total ativo" value={all.length} sub="colaboradores" accent="blue" href="/collaborators" />
        <KpiCard label="Júniores" value={byMacro.junior} sub={`${byMacro.junior > 0 ? Math.round((byMacro.junior/all.length)*100) : 0}% do time`} />
        <KpiCard label="Plenos" value={byMacro.pleno}  sub={`${byMacro.pleno > 0 ? Math.round((byMacro.pleno/all.length)*100) : 0}% do time`} />
        <KpiCard label="Sêniores" value={byMacro.senior} sub={`${byMacro.senior > 0 ? Math.round((byMacro.senior/all.length)*100) : 0}% do time`} />
        <KpiCard label="Afastados" value={onVacation + onLeave} sub={`${onVacation}f + ${onLeave}af`} accent={onVacation + onLeave > 0 ? 'amber' : undefined} />
      </div>

      {/* ── KPI row 2: alerts ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          label="Férias vencidas" value={vacExpiredCount}
          sub="ação imediata" accent={vacExpiredCount > 0 ? 'red' : 'green'}
          href="/vacations"
        />
        <KpiCard
          label="Férias vencendo 90d" value={vacExpiringCount}
          sub="agendar brevemente" accent={vacExpiringCount > 0 ? 'amber' : undefined}
          href="/vacations"
        />
        <KpiCard
          label="Sem promoção +18m" value={noPromoCount}
          sub="elegíveis para revisão" accent={noPromoCount > 0 ? 'amber' : undefined}
          href="/collaborators"
        />
        <KpiCard
          label="Média sem promoção" value={`${avgPromoMonths}m`}
          sub={avgPromoMonths >= 18 ? 'acima do alvo' : 'dentro do alvo'}
          accent={avgPromoMonths >= 18 ? 'amber' : 'green'}
        />
      </div>

      {/* ── Main content: 3-col grid ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Col 1-2: Distribution + Salary */}
        <div className="lg:col-span-2 space-y-5">

          {/* Level distribution pyramid */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800">Distribuição por nível</h2>
              <span className="text-xs text-slate-400">{all.length} colaboradores ativos</span>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {(['junior', 'pleno', 'senior'] as MacroKey[]).map(macro => (
                <div key={macro}>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={macro === 'junior' ? 'amber' : macro === 'pleno' ? 'blue' : 'purple'}>
                      {MACRO_LABELS[macro]}
                    </Badge>
                    <span className="text-xs font-semibold text-slate-600">{byMacro[macro]} total</span>
                  </div>
                  <div className="space-y-1.5">
                    {([1, 2, 3, 4] as GridLevel[]).map(level => (
                      <LevelBar
                        key={level}
                        macro={macro}
                        level={level}
                        count={byLevel[`${macro}-${level}`] ?? 0}
                        total={byMacro[macro]}
                        maxCount={maxLevelCount}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Salary overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800">Visão salarial</h2>
              <span className="text-xs text-slate-400">
                Média geral: <strong className="text-slate-700">{fmtCurrency(avgSalaryAll)}</strong>
              </span>
            </div>
            <div className="space-y-4">
              {(['junior', 'pleno', 'senior'] as MacroKey[]).map(macro => {
                const s = salaryByMacro[macro]
                if (s.count === 0) return null
                const avg = s.total / s.count

                // compute relative width for viz
                const maxAvgAll = Math.max(
                  ...(['junior', 'pleno', 'senior'] as MacroKey[]).map(m =>
                    salaryByMacro[m].count > 0 ? salaryByMacro[m].total / salaryByMacro[m].count : 0
                  )
                )
                const barWidth = maxAvgAll > 0 ? (avg / maxAvgAll) * 100 : 0
                const barColor = { junior: 'bg-amber-400', pleno: 'bg-blue-500', senior: 'bg-purple-500' }[macro]

                return (
                  <div key={macro}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Badge variant={macro === 'junior' ? 'amber' : macro === 'pleno' ? 'blue' : 'purple'}>
                          {MACRO_LABELS[macro]}
                        </Badge>
                        <span className="text-xs text-slate-400">{s.count} pessoa{s.count > 1 ? 's' : ''}</span>
                      </div>
                      <div className="text-xs text-right">
                        <span className="font-semibold text-slate-800">{fmtCurrency(avg)}</span>
                        <span className="text-slate-400 ml-1">média</span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-1">
                      <div className={`h-full ${barColor} rounded-full`} style={{ width: `${barWidth}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>mín: {s.min === Infinity ? '—' : fmtCurrency(s.min)}</span>
                      <span>máx: {fmtCurrency(s.max)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Upcoming vacations */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Próximas férias agendadas</h2>
              <Link href="/vacations" className="text-xs text-blue-600 hover:underline">Ver tudo →</Link>
            </div>
            {upcomingVacations.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Nenhuma férias agendada</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingVacations.slice(0, 6).map((v, i) => (
                  <Link key={i} href={`/collaborators/${v.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                    <Avatar name={v.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{v.name}</p>
                      <p className="text-xs text-slate-400">
                        {fmtDate(v.start)}{v.end ? ` → ${fmtDate(v.end)}` : ''}
                      </p>
                    </div>
                    <Badge variant={v.daysLeft < 0 ? 'red' : v.daysLeft <= 30 ? 'amber' : 'gray'}>
                      {v.daysLeft < 0 ? 'Vencida' : `${v.daysLeft}d`}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Col 3: Alerts + Anniversaries */}
        <div className="space-y-5">

          {/* Urgent alerts */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Pendências urgentes</h2>
              <span className="text-xs font-medium bg-red-100 text-red-700 rounded-full px-2 py-0.5">
                {urgentAlerts.length}
              </span>
            </div>
            {urgentAlerts.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-2xl mb-1">✓</p>
                <p className="text-sm text-slate-400">Nenhuma pendência</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
                {urgentAlerts.slice(0, 12).map((r, i) => {
                  const priorityBadge: Record<string, 'red' | 'amber' | 'gray'> = {
                    critical: 'red', high: 'amber', medium: 'gray',
                  }
                  return (
                    <Link
                      key={i}
                      href={`/collaborators/${r.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <Avatar name={r.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{r.name}</p>
                        <p className="text-xs text-slate-400 truncate">{r.team}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant={priorityBadge[r.priority]}>{r.alert}</Badge>
                        <p className="text-[10px] text-slate-400 mt-0.5">{r.detail}</p>
                      </div>
                    </Link>
                  )
                })}
                {urgentAlerts.length > 12 && (
                  <Link href="/collaborators" className="block px-4 py-2.5 text-xs text-blue-600 hover:bg-blue-50 text-center">
                    + {urgentAlerts.length - 12} mais → Ver todos
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Anniversaries */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">🎂 Aniversários de empresa</h2>
              <p className="text-xs text-slate-400 mt-0.5">Próximos 30 dias</p>
            </div>
            {anniversaries.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Nenhum nos próximos 30 dias</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {anniversaries.map((a, i) => (
                  <Link key={i} href={`/collaborators/${a.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                    <Avatar name={a.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{a.name}</p>
                      <p className="text-xs text-slate-400">{a.team}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-purple-700">{a.years} ano{a.years > 1 ? 's' : ''}</p>
                      <p className="text-[10px] text-slate-400">{a.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Ações rápidas</h2>
            <div className="space-y-2">
              {[
                { label: '+ Novo colaborador', href: '/collaborators/new', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
                { label: 'Agendar férias', href: '/vacations', color: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300' },
                { label: 'Editar grelha salarial', href: '/grid', color: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300' },
                { label: 'Ver todos os colaboradores', href: '/collaborators', color: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300' },
              ].map(a => (
                <Link key={a.href} href={a.href} className={`block text-center text-sm font-medium px-3 py-2 rounded-lg transition-colors ${a.color}`}>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
