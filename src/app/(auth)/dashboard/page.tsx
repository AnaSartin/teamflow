import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { fmtDate, fmtCurrency, MACRO_LABELS } from '@/lib/utils'
import {
  differenceInDays,
  differenceInMonths,
  parseISO,
  addYears,
  addMonths,
  addDays,
  format,
  startOfMonth,
  endOfMonth,
  isBefore,
  isAfter,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Avatar, Badge } from '@/components/ui'
import type { MacroRole } from '@/types'

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient()
  const today = new Date()

  const [
    { data: collaborators },
    { data: teams },
    { data: promotionPlans },
  ] = await Promise.all([
    supabase
      .from('collaborators')
      .select('*, vacations(*)')
      .neq('status', 'terminated')
      .order('name'),
    supabase.from('teams').select('*').order('name'),
    supabase
      .from('promotion_plans')
      .select('*, collaborators(id, name, team, macro_role, grid_level, current_salary)')
      .eq('status', 'planned')
      .order('effective_date'),
  ])

  const all = collaborators ?? []
  const teamList = teams ?? []
  const plans = promotionPlans ?? []

  const onVacation = all.filter(c => c.status === 'vacation').length
  const onLeave    = all.filter(c => c.status === 'leave').length

  // ── By macro ──────────────────────────────────────────────────────────────
  const byMacro: Record<string, number> = {}
  const byLevel: Record<string, number> = {}
  const salaryByMacro: Record<string, { total: number; count: number; min: number; max: number }> = {}

  for (const c of all) {
    byMacro[c.macro_role] = (byMacro[c.macro_role] ?? 0) + 1
    const lKey = `${c.macro_role}-${c.grid_level}`
    byLevel[lKey] = (byLevel[lKey] ?? 0) + 1

    if (!salaryByMacro[c.macro_role]) salaryByMacro[c.macro_role] = { total: 0, count: 0, min: Infinity, max: 0 }
    const s = salaryByMacro[c.macro_role]
    s.total += c.current_salary; s.count++
    if (c.current_salary < s.min) s.min = c.current_salary
    if (c.current_salary > s.max) s.max = c.current_salary
  }

  // ── By team ───────────────────────────────────────────────────────────────
  const countByTeam: Record<string, number> = {}
  const countByTeamLevel: Record<string, Record<string, number>> = {}

  for (const c of all) {
    if (!c.team_id) continue
    countByTeam[c.team_id] = (countByTeam[c.team_id] ?? 0) + 1
    if (!countByTeamLevel[c.team_id]) countByTeamLevel[c.team_id] = {}
    const lvl = c.team_level ?? 'Sem nível'
    countByTeamLevel[c.team_id][lvl] = (countByTeamLevel[c.team_id][lvl] ?? 0) + 1
  }

  // ── Promotion metrics ─────────────────────────────────────────────────────
  const urgentAlerts: Array<{
    id: string; name: string; team: string; macro_role: string
    alert: string; detail: string; priority: 'critical' | 'high' | 'medium'
  }> = []

  // ── Vacation intelligence (simplified model) ───────────────────────────────
  // Next expiry = last_vacation_date + 12m OR admission_date + 24m if never took vacation
  const vacExpiredCount_intel: number[] = []
  const vacExpiringCount_intel: number[] = []
  const vacOkCount_intel: number[] = []

  // ── Vacation metrics from vacations table ─────────────────────────────────
  let vacExpiredCount   = 0
  let vacExpiringCount  = 0

  // ── Upcoming vacations (future scheduled only) ───────────────────────────
  const upcomingVacations: Array<{
    id: string; name: string; team: string
    start: string; end: string | null
    duration: number; status: string
  }> = []

  // ── Férias neste mês (start, end ou ongoing dentro do mês atual) ──────────
  const monthStart = startOfMonth(today)
  const monthEnd   = endOfMonth(today)

  const thisMonthVacations: Array<{
    id: string; name: string; team: string
    start: string; lastDay: string; returnDate: string
    duration: number; status: string
  }> = []

  // ── Anniversaries in 30 days ──────────────────────────────────────────────
  const anniversaries: Array<{
    id: string; name: string; team: string; years: number; date: string
  }> = []

  let totalPromoMonths = 0
  let noPromoCount = 0
  const avgSalaryAll = all.length > 0
    ? all.reduce((s, c) => s + c.current_salary, 0) / all.length : 0

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

    // Vacation intelligence (simplified)
    const baseDate = c.last_vacation_date
      ? parseISO(c.last_vacation_date)
      : addMonths(parseISO(c.admission_date), 12)
    const nextExpiry = addMonths(baseDate, 12)
    const daysToExpiry = differenceInDays(nextExpiry, today)

    if (daysToExpiry < 0) {
      vacExpiredCount_intel.push(daysToExpiry)
    } else if (daysToExpiry <= 90) {
      vacExpiringCount_intel.push(daysToExpiry)
    } else {
      vacOkCount_intel.push(daysToExpiry)
    }

    // Vacations table
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
      // Upcoming: scheduled, starts in the future
      if (v.scheduled_start && v.status === 'scheduled' && isAfter(parseISO(v.scheduled_start), today)) {
        const dur = v.scheduled_end
          ? differenceInDays(parseISO(v.scheduled_end), parseISO(v.scheduled_start))
          : 0
        upcomingVacations.push({
          id: c.id, name: c.name, team: c.team,
          start: v.scheduled_start,
          end: v.scheduled_end || null,
          duration: dur,
          status: v.status,
        })
      }

      // This month: overlaps with current month (any status with scheduled dates)
      if (v.scheduled_start && v.scheduled_end) {
        const vStart = parseISO(v.scheduled_start)
        const vEnd   = parseISO(v.scheduled_end)  // return-to-work day
        const overlaps =
          !isAfter(vStart, monthEnd) && !isBefore(vEnd, monthStart)
        if (overlaps && v.status !== 'not_scheduled') {
          const dur = differenceInDays(vEnd, vStart)
          const lastDay = addDays(vEnd, -1)
          thisMonthVacations.push({
            id: c.id, name: c.name, team: c.team,
            start: v.scheduled_start,
            lastDay: format(lastDay, 'yyyy-MM-dd'),
            returnDate: v.scheduled_end,
            duration: dur,
            status: v.status,
          })
        }
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

  // Sort alerts: critical first
  urgentAlerts.sort((a, b) => {
    const p = { critical: 0, high: 1, medium: 2 }
    return p[a.priority] - p[b.priority]
  })

  // Sort by start date
  upcomingVacations.sort((a, b) => a.start.localeCompare(b.start))
  thisMonthVacations.sort((a, b) => a.start.localeCompare(b.start))

  // Promotion plans financial impact
  const plansImpact = plans.reduce((sum, p) => {
    const current = p.collaborators?.current_salary ?? 0
    return sum + (p.new_salary - current)
  }, 0)

  // Promotion plans by proximity
  const plansThisMonth = plans.filter(p => {
    const effDate = parseISO(p.effective_date)
    return differenceInDays(effDate, today) <= 30
  })

  const macroKeys = Object.keys(byMacro)

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
        <KpiCard label="Equipes" value={teamList.length} sub="grupos ativos" href="/teams" />
        <KpiCard label="Afastados" value={onVacation + onLeave} sub={`${onVacation}f + ${onLeave}af`} accent={onVacation + onLeave > 0 ? 'amber' : undefined} />
        <KpiCard label="Promoções planejadas" value={plans.length} sub={plans.length > 0 ? `impacto ${fmtCurrency(plansImpact)}/mês` : 'nenhuma planejada'} accent={plans.length > 0 ? 'purple' : undefined} href="/collaborators" />
        <KpiCard label="Sem promoção +18m" value={noPromoCount} sub="elegíveis para revisão" accent={noPromoCount > 0 ? 'amber' : undefined} href="/collaborators" />
      </div>

      {/* ── KPI row 2: férias ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Férias vencidas" value={vacExpiredCount} sub="ação imediata" accent={vacExpiredCount > 0 ? 'red' : 'green'} href="/vacations" />
        <KpiCard label="Férias vencendo 90d" value={vacExpiringCount} sub="agendar brevemente" accent={vacExpiringCount > 0 ? 'amber' : undefined} href="/vacations" />
        <KpiCard label="Média sem promoção" value={`${avgPromoMonths}m`} sub={avgPromoMonths >= 18 ? 'acima do alvo' : 'dentro do alvo'} accent={avgPromoMonths >= 18 ? 'amber' : 'green'} />
        <KpiCard label="Promoções este mês" value={plansThisMonth.length} sub={plansThisMonth.length > 0 ? 'vigência em 30 dias' : 'nenhuma este mês'} accent={plansThisMonth.length > 0 ? 'purple' : undefined} />
      </div>

      {/* ── Team distribution ── */}
      {teamList.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Distribuição por equipe</h2>
            <Link href="/teams" className="text-xs text-blue-600 hover:underline">Gerenciar equipes →</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {teamList.map(team => {
              const total = countByTeam[team.id] ?? 0
              const levels = countByTeamLevel[team.id] ?? {}
              const pct = all.length > 0 ? Math.round((total / all.length) * 100) : 0
              return (
                <div key={team.id} className="border border-slate-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{team.name}</p>
                      {team.type && <p className="text-xs text-slate-400 capitalize">{team.type}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-700">{total}</p>
                      <p className="text-xs text-slate-400">{pct}%</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {['N1', 'N2', 'Coordenação'].map(lvl => {
                      const count = levels[lvl] ?? 0
                      const lvlPct = total > 0 ? Math.round((count / total) * 100) : 0
                      return (
                        <div key={lvl} className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500 w-20 shrink-0">{lvl}</span>
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${lvlPct}%` }} />
                          </div>
                          <span className="font-medium text-slate-700 w-4 text-right">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Main content: 3-col grid ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Col 1-2: Distribution + Salary + Plans */}
        <div className="lg:col-span-2 space-y-5">

          {/* Level distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800">Distribuição por cargo e nível</h2>
              <span className="text-xs text-slate-400">{all.length} ativos</span>
            </div>
            <div className={`grid gap-6 ${macroKeys.length <= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
              {macroKeys.map(macro => {
                const macroTotal = byMacro[macro] ?? 0
                const levels = [1, 2, 3, 4].map(l => ({ l, c: byLevel[`${macro}-${l}`] ?? 0 })).filter(x => x.c > 0 || macroTotal > 0)
                const maxCount = Math.max(...levels.map(x => x.c), 1)
                const variant = macro === 'junior' ? 'amber' : macro === 'pleno' ? 'blue' : macro === 'senior' ? 'purple' : 'gray'
                const label = MACRO_LABELS[macro as MacroRole] ?? (macro.charAt(0).toUpperCase() + macro.slice(1))
                return (
                  <div key={macro}>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={variant as 'amber' | 'blue' | 'purple' | 'gray'}>{label}</Badge>
                      <span className="text-xs font-semibold text-slate-600">{macroTotal} total</span>
                    </div>
                    <div className="space-y-1.5">
                      {[1, 2, 3, 4].map(level => {
                        const count = byLevel[`${macro}-${level}`] ?? 0
                        const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
                        const barColor = macro === 'junior' ? 'bg-amber-400' : macro === 'pleno' ? 'bg-blue-500' : macro === 'senior' ? 'bg-purple-500' : 'bg-slate-400'
                        return (
                          <div key={level} className="flex items-center gap-2">
                            <span className="text-xs font-mono font-semibold text-slate-500 w-6 shrink-0">N{level}</span>
                            <div className="flex-1 h-5 bg-slate-100 rounded overflow-hidden">
                              <div
                                className={`h-full ${barColor} rounded transition-all flex items-center pl-1.5`}
                                style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                              >
                                {count > 0 && <span className="text-[10px] font-bold text-white">{count}</span>}
                              </div>
                            </div>
                            <span className="text-xs text-slate-400 w-8 text-right shrink-0">
                              {macroTotal > 0 ? `${Math.round((count / macroTotal) * 100)}%` : '0%'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Promotion plans */}
          {plans.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">Promoções planejadas</h2>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Impacto total: <strong className="text-purple-700">{fmtCurrency(plansImpact)}</strong>/mês</span>
                  <span className="text-xs font-medium bg-purple-100 text-purple-700 rounded-full px-2 py-0.5">{plans.length}</span>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {plans.slice(0, 6).map((plan, i) => {
                  const collab = plan.collaborators
                  const daysUntil = differenceInDays(parseISO(plan.effective_date), today)
                  const isUrgent = daysUntil <= 30
                  return (
                    <Link key={i} href={`/collaborators/${collab?.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                      <Avatar name={collab?.name ?? '?'} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{collab?.name}</p>
                        <p className="text-xs text-slate-400 truncate">→ {plan.new_full_title}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-purple-700">{fmtCurrency(plan.new_salary)}</p>
                        <Badge variant={isUrgent ? 'amber' : 'gray'}>
                          {isUrgent ? `${daysUntil}d` : fmtDate(plan.effective_date)}
                        </Badge>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Salary overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800">Visão salarial</h2>
              <span className="text-xs text-slate-400">
                Média geral: <strong className="text-slate-700">{fmtCurrency(avgSalaryAll)}</strong>
              </span>
            </div>
            <div className="space-y-4">
              {macroKeys.map(macro => {
                const s = salaryByMacro[macro]
                if (!s || s.count === 0) return null
                const avg = s.total / s.count
                const maxAvgAll = Math.max(
                  ...macroKeys.map(m => salaryByMacro[m]?.count > 0 ? salaryByMacro[m].total / salaryByMacro[m].count : 0)
                )
                const barWidth = maxAvgAll > 0 ? (avg / maxAvgAll) * 100 : 0
                const barColor = macro === 'junior' ? 'bg-amber-400' : macro === 'pleno' ? 'bg-blue-500' : macro === 'senior' ? 'bg-purple-500' : 'bg-slate-400'
                const variant = macro === 'junior' ? 'amber' : macro === 'pleno' ? 'blue' : macro === 'senior' ? 'purple' : 'gray'
                const label = MACRO_LABELS[macro as MacroRole] ?? (macro.charAt(0).toUpperCase() + macro.slice(1))

                return (
                  <div key={macro}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Badge variant={variant as 'amber' | 'blue' | 'purple' | 'gray'}>{label}</Badge>
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

          {/* Férias neste mês */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Férias neste mês</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {format(today, 'MMMM yyyy', { locale: ptBR })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {thisMonthVacations.length > 0 && (
                  <span className="text-xs font-medium bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">
                    {thisMonthVacations.length}
                  </span>
                )}
                <Link href="/vacations" className="text-xs text-blue-600 hover:underline">Ver agenda →</Link>
              </div>
            </div>
            {thisMonthVacations.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-slate-400 text-sm">Nenhuma férias neste mês</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left text-xs font-medium text-slate-500 px-4 py-2">Colaborador</th>
                      <th className="text-left text-xs font-medium text-slate-500 px-4 py-2 hidden md:table-cell">Equipe</th>
                      <th className="text-left text-xs font-medium text-slate-500 px-4 py-2">Período</th>
                      <th className="text-left text-xs font-medium text-slate-500 px-4 py-2 hidden sm:table-cell">Duração</th>
                      <th className="text-left text-xs font-medium text-slate-500 px-4 py-2 hidden lg:table-cell">Retorno</th>
                      <th className="text-left text-xs font-medium text-slate-500 px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {thisMonthVacations.map((v, i) => {
                      const statusMap: Record<string, { label: string; variant: 'blue' | 'green' | 'gray' | 'amber' }> = {
                        scheduled: { label: 'Agendada',    variant: 'blue'  },
                        ongoing:   { label: 'Em andamento', variant: 'green' },
                        completed: { label: 'Finalizada',  variant: 'gray'  },
                      }
                      const st = statusMap[v.status] ?? { label: v.status, variant: 'gray' as const }
                      return (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <Link href={`/collaborators/${v.id}`} className="flex items-center gap-2.5 hover:underline">
                              <Avatar name={v.name} size="sm" />
                              <span className="text-sm font-medium text-slate-800 truncate max-w-[120px]">{v.name}</span>
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">{v.team || '—'}</td>
                          <td className="px-4 py-3 text-xs text-slate-700">
                            <span className="font-medium">{fmtDate(v.start)}</span>
                            <span className="text-slate-400 mx-1">→</span>
                            <span className="font-medium">{fmtDate(v.lastDay)}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600 hidden sm:table-cell">
                            {v.duration} dia{v.duration !== 1 ? 's' : ''}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="text-xs font-medium text-emerald-700">{fmtDate(v.returnDate)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={st.variant}>{st.label}</Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Próximas férias agendadas */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Próximas férias agendadas</h2>
                <p className="text-xs text-slate-400 mt-0.5">Agendamentos futuros confirmados</p>
              </div>
              <Link href="/vacations" className="text-xs text-blue-600 hover:underline">Ver tudo →</Link>
            </div>
            {upcomingVacations.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Nenhum agendamento futuro</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingVacations.slice(0, 6).map((v, i) => {
                  const daysUntil = differenceInDays(parseISO(v.start), today)
                  return (
                    <Link key={i} href={`/collaborators/${v.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                      <Avatar name={v.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{v.name}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {v.team && <span className="mr-2">{v.team} ·</span>}
                          {fmtDate(v.start)}
                          {v.end ? ` → ${fmtDate(v.end)}` : ''}
                          {v.duration > 0 ? ` · ${v.duration}d` : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant={daysUntil <= 7 ? 'amber' : 'blue'}>
                          em {daysUntil}d
                        </Badge>
                        {v.end && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            retorno {fmtDate(v.end)}
                          </p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Col 3: Alerts + Anniversaries + Quick actions */}
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
                { label: 'Gerenciar equipes', href: '/teams', color: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300' },
                { label: 'Agendar férias', href: '/vacations', color: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300' },
                { label: 'Editar grelha salarial', href: '/grid', color: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300' },
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
