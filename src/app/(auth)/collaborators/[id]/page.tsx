import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge, Avatar, AlertBanner } from '@/components/ui'
import { fmtDate, fmtCurrency, calcTenure, buildTitle, MACRO_LABELS, STATUS_LABELS } from '@/lib/utils'
import { differenceInMonths, differenceInDays, parseISO, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import PromotionModal from '@/components/collaborators/PromotionModal'
import RaiseModal from '@/components/collaborators/RaiseModal'
import DeleteCollaboratorButton from '@/components/collaborators/DeleteCollaboratorButton'
import {
  CreatePromotionPlanModal,
  ApplyPlanButton,
  CancelPlanButton,
} from '@/components/promotion-plans/PromotionPlanModal'
import type { MacroRole, CollaboratorStatus } from '@/types'

export default async function CollaboratorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: c },
    { data: vacations },
    { data: promoHistory },
    { data: salaryHistory },
    { data: promotionPlans },
  ] = await Promise.all([
    supabase.from('collaborators').select('*, teams(name, type)').eq('id', id).single(),
    supabase.from('vacations').select('*').eq('collaborator_id', id).order('acquisition_start', { ascending: false }),
    supabase.from('promotion_history').select('*').eq('collaborator_id', id).order('event_date', { ascending: false }),
    supabase.from('salary_history').select('*').eq('collaborator_id', id).order('event_date', { ascending: false }),
    supabase
      .from('promotion_plans')
      .select('*')
      .eq('collaborator_id', id)
      .order('effective_date'),
  ])

  if (!c) notFound()

  const today = new Date()
  const tenure = calcTenure(c.admission_date)
  const lastPromo = c.last_promotion_date || c.admission_date
  const monthsSincePromo = differenceInMonths(today, parseISO(lastPromo))
  const monthsSinceRaise = c.last_raise_date ? differenceInMonths(today, parseISO(c.last_raise_date)) : null

  // Vacation expiry
  const activeVacation = vacations?.find(v => v.status !== 'completed')
  const vacExpDays = activeVacation ? differenceInDays(parseISO(activeVacation.expiry_date), today) : null

  // Promotion plans
  const plannedPromos = (promotionPlans ?? []).filter(p => p.status === 'planned')
  const appliedPromos = (promotionPlans ?? []).filter(p => p.status === 'applied')

  const macroVariant = (macro: string): 'amber' | 'blue' | 'purple' | 'gray' => {
    const MAP: Record<string, 'amber' | 'blue' | 'purple'> = {
      junior: 'amber', pleno: 'blue', senior: 'purple',
    }
    return MAP[macro] ?? 'gray'
  }

  const statusVariant: Record<CollaboratorStatus, 'green' | 'blue' | 'amber' | 'red'> = {
    active: 'green',
    vacation: 'blue',
    leave: 'amber',
    terminated: 'red',
  }

  // Team name resolution
  const teamName = (c as Record<string, unknown>).teams
    ? ((c as Record<string, unknown>).teams as { name: string }).name
    : c.team

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        <Link href="/collaborators" className="text-sm text-slate-500 hover:text-slate-800">← Colaboradores</Link>
      </div>

      {/* Alerts */}
      {vacExpDays !== null && vacExpDays < 0 && (
        <AlertBanner type="error">Férias vencidas há {Math.abs(vacExpDays)} dias. Agendar imediatamente.</AlertBanner>
      )}
      {vacExpDays !== null && vacExpDays >= 0 && vacExpDays <= 60 && (
        <AlertBanner type="warning">Férias vencem em {vacExpDays} dias. Considere agendar.</AlertBanner>
      )}
      {monthsSincePromo >= 18 && (
        <AlertBanner type="warning">{monthsSincePromo} meses sem promoção. Colaborador pode estar elegível para revisão.</AlertBanner>
      )}
      {plannedPromos.length > 0 && (
        <AlertBanner type="info">
          {plannedPromos.length} promoção{plannedPromos.length > 1 ? 'ões' : ''} planejada{plannedPromos.length > 1 ? 's' : ''} — próxima em {format(parseISO(plannedPromos[0].effective_date), 'dd/MM/yyyy', { locale: ptBR })}.
        </AlertBanner>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4 flex items-start gap-4">
        <Avatar name={c.name} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{c.name}</h1>
              <p className="text-sm text-slate-500 mt-0.5">{c.full_title}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant={macroVariant(c.macro_role)}>
                  {MACRO_LABELS[c.macro_role as MacroRole] ?? c.macro_role}
                </Badge>
                <Badge variant="gray">N{c.grid_level}</Badge>
                {c.team_level && <Badge variant="gray">{c.team_level}</Badge>}
                <Badge variant={statusVariant[c.status as CollaboratorStatus] ?? 'gray'}>
                  {STATUS_LABELS[c.status as keyof typeof STATUS_LABELS]}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <DeleteCollaboratorButton id={id} name={c.name} />
              <Link
                href={`/collaborators/${id}/edit`}
                className="text-sm border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                Editar
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2-col */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Key info */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Informações principais</h2>
          <dl className="space-y-2.5">
            {([
              ['E-mail', c.email],
              ['Equipe', teamName || '—'],
              ['Nível na equipe', c.team_level ?? '—'],
              ['Gestor', c.manager || '—'],
              ['Admissão', fmtDate(c.admission_date)],
              ['Tempo de empresa', tenure],
              ['Salário atual', fmtCurrency(c.current_salary)],
              ['Último reajuste', fmtDate(c.last_raise_date)],
              ['Há quanto tempo', monthsSinceRaise !== null ? `${monthsSinceRaise}m atrás` : '—'],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Vacation */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Controle de férias</h2>
          {activeVacation ? (
            <dl className="space-y-2.5">
              {([
                ['Período aquisitivo', `${fmtDate(activeVacation.acquisition_start)} – ${fmtDate(activeVacation.acquisition_end)}`],
                ['Vencimento', fmtDate(activeVacation.expiry_date)],
                ['Situação', vacExpDays !== null && vacExpDays < 0 ? `Vencidas há ${Math.abs(vacExpDays)}d` : vacExpDays !== null ? `${vacExpDays}d restantes` : '—'],
                ['Férias agendadas', activeVacation.scheduled_start ? `${fmtDate(activeVacation.scheduled_start)} → ${fmtDate(activeVacation.scheduled_end)}` : 'Não agendadas'],
                ['Última conclusão', fmtDate(c.last_vacation_date)],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-medium text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-400">Nenhum período de férias registrado.</p>
              <Link href="/vacations" className="text-xs text-blue-600 hover:underline">
                Registrar na página de férias →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Promotion actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Promoção & reajuste</h2>
          <div className="flex gap-2">
            <CreatePromotionPlanModal
              collaboratorId={c.id}
              collaboratorName={c.name}
              currentSalary={c.current_salary}
            />
            <PromotionModal collaborator={c} />
            <RaiseModal collaborator={c} />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {([
            ['Última promoção', fmtDate(c.last_promotion_date)],
            ['Meses sem promoção', `${monthsSincePromo}m`],
            ['Próximo nível', c.next_level_forecast || '—'],
            ['Previsão', fmtDate(c.promotion_forecast_date)],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} className="bg-slate-50 rounded-lg p-3">
              <p className="text-[11px] text-slate-400 mb-1">{label}</p>
              <p className="text-sm font-semibold text-slate-800">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Promotion plans */}
      {(plannedPromos.length > 0 || appliedPromos.length > 0) && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Planos de promoção</h2>
          <div className="space-y-3">
            {plannedPromos.map(plan => (
              <div key={plan.id} className="flex items-center gap-4 bg-purple-50 border border-purple-100 rounded-lg px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    → {plan.new_full_title} · {fmtCurrency(plan.new_salary)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Vigência: {fmtDate(plan.effective_date)}
                    {plan.notes ? ` · ${plan.notes}` : ''}
                  </p>
                </div>
                <Badge variant="purple">Planejado</Badge>
                <div className="flex gap-2 shrink-0">
                  <ApplyPlanButton plan={plan} collaboratorName={c.name} />
                  <CancelPlanButton planId={plan.id} collaboratorName={c.name} />
                </div>
              </div>
            ))}
            {appliedPromos.slice(0, 3).map(plan => (
              <div key={plan.id} className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3 opacity-70">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">
                    ✓ {plan.new_full_title} · {fmtCurrency(plan.new_salary)}
                  </p>
                  <p className="text-xs text-slate-500">Aplicado · Vigência: {fmtDate(plan.effective_date)}</p>
                </div>
                <Badge variant="green">Aplicado</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Promotion history */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Histórico de promoções</h2>
          {promoHistory && promoHistory.length > 0 ? (
            <div className="space-y-3">
              {promoHistory.map(p => {
                const prevTitle = p.previous_macro_role && p.previous_level
                  ? buildTitle(p.previous_macro_role as MacroRole, p.previous_level as 1)
                  : '—'
                const newTitle = buildTitle(p.new_macro_role as MacroRole, p.new_level as 1)
                return (
                  <div key={p.id} className="relative pl-4 border-l-2 border-blue-200">
                    <p className="text-xs text-slate-400">{fmtDate(p.event_date)}</p>
                    <p className="text-sm font-medium text-slate-800">
                      {prevTitle} → {newTitle}
                    </p>
                    <p className="text-xs text-slate-500">
                      {fmtCurrency(p.salary_before)} → {fmtCurrency(p.salary_after)}
                      {p.salary_before > 0 && (
                        <span className="text-emerald-600 ml-1">
                          (+{Math.round(((p.salary_after - p.salary_before) / p.salary_before) * 100)}%)
                        </span>
                      )}
                    </p>
                    {p.notes && <p className="text-xs text-slate-400 mt-0.5">{p.notes}</p>}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Nenhuma promoção registrada.</p>
          )}
        </div>

        {/* Salary history */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Histórico salarial</h2>
          {salaryHistory && salaryHistory.length > 0 ? (
            <div className="space-y-3">
              {salaryHistory.map(s => (
                <div key={s.id} className="relative pl-4 border-l-2 border-emerald-200">
                  <p className="text-xs text-slate-400">{fmtDate(s.event_date)}</p>
                  <p className="text-sm font-medium text-slate-800">{fmtCurrency(s.salary_after)}</p>
                  <p className="text-xs text-slate-500">{s.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Nenhum histórico salarial.</p>
          )}
        </div>
      </div>

      {c.notes && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mt-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Observações gerenciais</h2>
          <p className="text-sm text-slate-700 leading-relaxed">{c.notes}</p>
        </div>
      )}
    </div>
  )
}
