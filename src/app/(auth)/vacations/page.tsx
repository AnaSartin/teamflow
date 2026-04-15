import { createClient } from '@/lib/supabase/server'
import { SectionHeader, Badge, Avatar } from '@/components/ui'
import { fmtDate } from '@/lib/utils'
import { differenceInDays, parseISO, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import VacationModal from '@/components/vacations/VacationModal'
import NewVacationPeriodModal from '@/components/vacations/NewVacationPeriodModal'

export default async function VacationsPage() {
  const supabase = await createClient()
  const today = new Date()

  const [{ data }, { data: allCollaborators }] = await Promise.all([
    supabase
      .from('vacations')
      .select('*, collaborators(id, name, team, macro_role, full_title)')
      .neq('status', 'completed')
      .order('expiry_date'),
    supabase
      .from('collaborators')
      .select('id, name, team')
      .neq('status', 'terminated')
      .order('name'),
  ])

  const all = data ?? []
  const collaborators = allCollaborators ?? []

  const expired   = all.filter(v => differenceInDays(parseISO(v.expiry_date), today) < 0)
  const expiring  = all.filter(v => { const d = differenceInDays(parseISO(v.expiry_date), today); return d >= 0 && d <= 90 })
  const scheduled = all.filter(v => v.scheduled_start && v.status === 'scheduled')
  const ongoing   = all.filter(v => v.status === 'ongoing')
  const notScheduled = all.filter(v => !v.scheduled_start && v.status === 'not_scheduled')

  // Group upcoming by month
  const byMonth: Record<string, typeof scheduled> = {}
  for (const v of scheduled) {
    const key = format(parseISO(v.scheduled_start!), 'yyyy-MM')
    if (!byMonth[key]) byMonth[key] = []
    byMonth[key].push(v)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <SectionHeader
        title="Agenda de Férias"
        description="Controle e programação de férias da equipe"
        action={<NewVacationPeriodModal collaborators={collaborators} />}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Em andamento', value: ongoing.length, accent: 'blue' as const },
          { label: 'Agendadas', value: scheduled.length, accent: 'green' as const },
          { label: 'Não agendadas', value: notScheduled.length, accent: undefined },
          { label: 'Vencendo em 90d', value: expiring.length, accent: 'amber' as const },
          { label: 'Vencidas', value: expired.length, accent: expired.length > 0 ? 'red' as const : undefined },
        ].map(item => (
          <div key={item.label} className={`bg-white rounded-xl border p-4 ${item.accent === 'red' && item.value > 0 ? 'border-l-4 border-l-red-400 bg-red-50' : item.accent === 'amber' && item.value > 0 ? 'border-l-4 border-l-amber-400 bg-amber-50' : 'border-slate-200'}`}>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{item.label}</p>
            <p className="text-2xl font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Expired */}
      {expired.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Férias vencidas ({expired.length})
          </h2>
          <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-red-50 border-b border-red-100">
                  <th className="text-left text-xs font-medium text-red-600 px-4 py-2.5">Colaborador</th>
                  <th className="text-left text-xs font-medium text-red-600 px-4 py-2.5 hidden md:table-cell">Equipe</th>
                  <th className="text-left text-xs font-medium text-red-600 px-4 py-2.5">Vencimento</th>
                  <th className="text-left text-xs font-medium text-red-600 px-4 py-2.5">Situação</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-red-50">
                {expired.map(v => {
                  const days = Math.abs(differenceInDays(parseISO(v.expiry_date), today))
                  const c = v.collaborators
                  return (
                    <tr key={v.id} className="hover:bg-red-50/50">
                      <td className="px-4 py-3">
                        <Link href={`/collaborators/${c?.id}`} className="flex items-center gap-2.5 hover:underline">
                          <Avatar name={c?.name ?? ''} size="sm" />
                          <span className="text-sm font-medium text-slate-800">{c?.name}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">{c?.team}</td>
                      <td className="px-4 py-3"><Badge variant="red">{fmtDate(v.expiry_date)}</Badge></td>
                      <td className="px-4 py-3 text-sm font-medium text-red-600">{days}d vencidas</td>
                      <td className="px-4 py-3">
                        {c && <VacationModal vacation={v} collaborator={{ id: c.id, name: c.name }} />}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Expiring soon */}
      {expiring.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Vencendo em 90 dias ({expiring.length})
          </h2>
          <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-amber-50 border-b border-amber-100">
                  <th className="text-left text-xs font-medium text-amber-700 px-4 py-2.5">Colaborador</th>
                  <th className="text-left text-xs font-medium text-amber-700 px-4 py-2.5">Vencimento</th>
                  <th className="text-left text-xs font-medium text-amber-700 px-4 py-2.5">Dias restantes</th>
                  <th className="text-left text-xs font-medium text-amber-700 px-4 py-2.5">Agendadas</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {expiring.map(v => {
                  const days = differenceInDays(parseISO(v.expiry_date), today)
                  const c = v.collaborators
                  return (
                    <tr key={v.id} className="hover:bg-amber-50/50">
                      <td className="px-4 py-3">
                        <Link href={`/collaborators/${c?.id}`} className="flex items-center gap-2.5 hover:underline">
                          <Avatar name={c?.name ?? ''} size="sm" />
                          <span className="text-sm font-medium text-slate-800">{c?.name}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3"><Badge variant="amber">{fmtDate(v.expiry_date)}</Badge></td>
                      <td className="px-4 py-3 text-sm font-medium text-amber-700">{days}d</td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {v.scheduled_start ? `${fmtDate(v.scheduled_start)} – ${fmtDate(v.scheduled_end)}` : 'Não agendadas'}
                      </td>
                      <td className="px-4 py-3">
                        {c && <VacationModal vacation={v} collaborator={{ id: c.id, name: c.name }} />}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Not scheduled */}
      {notScheduled.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" /> Não agendadas ({notScheduled.length})
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Colaborador</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5 hidden md:table-cell">Equipe</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Vencimento</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5 hidden md:table-cell">Dias restantes</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notScheduled.map(v => {
                  const days = differenceInDays(parseISO(v.expiry_date), today)
                  const c = v.collaborators
                  return (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link href={`/collaborators/${c?.id}`} className="flex items-center gap-2.5 hover:underline">
                          <Avatar name={c?.name ?? ''} size="sm" />
                          <span className="text-sm font-medium text-slate-800">{c?.name}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">{c?.team}</td>
                      <td className="px-4 py-3"><Badge variant="gray">{fmtDate(v.expiry_date)}</Badge></td>
                      <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">{days > 0 ? `${days}d` : 'Vencida'}</td>
                      <td className="px-4 py-3">
                        {c && <VacationModal vacation={v} collaborator={{ id: c.id, name: c.name }} />}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Scheduled by month */}
      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Férias agendadas por mês</h2>
        {Object.keys(byMonth).length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
            Nenhuma férias agendada no momento.
          </div>
        )}
        {Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([key, vacList]) => (
          <div key={key} className="mb-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              {format(parseISO(`${key}-01`), 'MMMM yyyy', { locale: ptBR })}
            </h3>
            <div className="space-y-1.5">
              {vacList.map(v => {
                const c = v.collaborators
                const daysLeft = differenceInDays(parseISO(v.expiry_date), today)
                return (
                  <div key={v.id}
                    className="flex items-center gap-3 bg-white rounded-lg border border-slate-200 px-4 py-2.5"
                  >
                    <Avatar name={c?.name ?? ''} size="sm" />
                    <div className="flex-1 min-w-0">
                      <Link href={`/collaborators/${c?.id}`} className="text-sm font-medium text-slate-800 hover:underline">
                        {c?.name}
                      </Link>
                      <p className="text-xs text-slate-400">{c?.team}</p>
                    </div>
                    <span className="text-xs text-slate-600 font-medium">
                      {fmtDate(v.scheduled_start)} → {fmtDate(v.scheduled_end)}
                    </span>
                    <Badge variant={daysLeft < 90 ? 'amber' : 'green'}>
                      vence {fmtDate(v.expiry_date)}
                    </Badge>
                    {c && (
                      <VacationModal vacation={v} collaborator={{ id: c.id, name: c.name }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
