import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge, Avatar, AlertBanner } from '@/components/ui'
import { fmtDate, fmtCurrency, calcTenure, buildTitle, MACRO_LABELS, STATUS_LABELS } from '@/lib/utils'
import { differenceInMonths, differenceInDays, parseISO } from 'date-fns'
import PromotionModal from '@/components/collaborators/PromotionModal'
import RaiseModal from '@/components/collaborators/RaiseModal'

export default async function CollaboratorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: c }, { data: vacations }, { data: promoHistory }, { data: salaryHistory }] = await Promise.all([
    supabase.from('collaborators').select('*').eq('id', id).single(),
    supabase.from('vacations').select('*').eq('collaborator_id', id).order('acquisition_start', { ascending: false }),
    supabase.from('promotion_history').select('*').eq('collaborator_id', id).order('event_date', { ascending: false }),
    supabase.from('salary_history').select('*').eq('collaborator_id', id).order('event_date', { ascending: false }),
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

  const roleVariants: Record<string, "amber" | "blue" | "purple"> = {
  junior: "amber",
  pleno: "blue",
  senior: "purple",
}

const macroVariant = roleVariants[c.macro_role] ?? "amber"

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

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4 flex items-start gap-4">
        <Avatar name={c.name} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{c.name}</h1>
              <p className="text-sm text-slate-500 mt-0.5">{c.full_title}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant={macroVariant}>{MACRO_LABELS[c.macro_role as keyof typeof MACRO_LABELS]}</Badge>
                <Badge variant="gray">N{c.grid_level}</Badge>
                <Badge variant={c.status === 'active' ? 'green' : c.status === 'vacation' ? 'blue' : c.status === 'leave' ? 'amber' : 'red'}>
                  {STATUS_LABELS[c.status as keyof typeof STATUS_LABELS]}
                </Badge>
              </div>
            </div>
            <Link href={`/collaborators/${id}/edit`} className="text-sm border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap">
              Editar
            </Link>
          </div>
        </div>
      </div>

      {/* Grid 2-col */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Key info */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Informações principais</h2>
          <dl className="space-y-2.5">
            {[
              ['E-mail', c.email],
              ['Equipe', c.team],
              ['Gestor', c.manager || '—'],
              ['Admissão', fmtDate(c.admission_date)],
              ['Tempo de empresa', tenure],
              ['Salário atual', fmtCurrency(c.current_salary)],
              ['Último reajuste', fmtDate(c.last_raise_date)],
              ['Há quanto tempo', monthsSinceRaise !== null ? `${monthsSinceRaise}m atrás` : '—'],
            ].map(([label, value]) => (
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
              {[
                ['Período aquisitivo', `${fmtDate(activeVacation.acquisition_start)} – ${fmtDate(activeVacation.acquisition_end)}`],
                ['Vencimento', fmtDate(activeVacation.expiry_date)],
                ['Situação', vacExpDays !== null && vacExpDays < 0 ? `Vencidas há ${Math.abs(vacExpDays)}d` : vacExpDays !== null ? `${vacExpDays}d restantes` : '—'],
                ['Férias agendadas', activeVacation.scheduled_start ? `${fmtDate(activeVacation.scheduled_start)} → ${fmtDate(activeVacation.scheduled_end)}` : 'Não agendadas'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-medium text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-slate-400">Nenhum período de férias registrado.</p>
          )}
        </div>
      </div>

      {/* Promotion actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Promoção & reajuste</h2>
          <div className="flex gap-2">
            <PromotionModal collaborator={c} />
            <RaiseModal collaborator={c} />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['Última promoção', fmtDate(c.last_promotion_date)],
            ['Meses sem promoção', `${monthsSincePromo}m`],
            ['Próximo nível', c.next_level_forecast || '—'],
            ['Previsão', fmtDate(c.promotion_forecast_date)],
          ].map(([label, value]) => (
            <div key={label} className="bg-slate-50 rounded-lg p-3">
              <p className="text-[11px] text-slate-400 mb-1">{label}</p>
              <p className="text-sm font-semibold text-slate-800">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Promotion history */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Histórico de promoções</h2>
          {promoHistory && promoHistory.length > 0 ? (
            <div className="space-y-3">
              {promoHistory.map(p => (
                <div key={p.id} className="relative pl-4 border-l-2 border-blue-200">
                  <p className="text-xs text-slate-400">{fmtDate(p.event_date)}</p>
                  <p className="text-sm font-medium text-slate-800">
                    {buildTitle(p.previous_macro_role, p.previous_level)} → {buildTitle(p.new_macro_role, p.new_level)}
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
              ))}
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
