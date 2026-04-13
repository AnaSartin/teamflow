import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SectionHeader, Badge, Avatar } from '@/components/ui'
import { fmtDate, fmtCurrency, calcTenure, MACRO_LABELS, STATUS_LABELS } from '@/lib/utils'
import { differenceInMonths, parseISO } from 'date-fns'
import CollaboratorsFilters from '@/components/collaborators/CollaboratorsFilters'

export default async function CollaboratorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('collaborators')
    .select('*')
    .order('name')

  if (params.status) query = query.eq('status', params.status)
  if (params.macro)  query = query.eq('macro_role', params.macro)
  if (params.level)  query = query.eq('grid_level', parseInt(params.level))
  if (params.team)   query = query.ilike('team', `%${params.team}%`)
  if (params.q)      query = query.ilike('name', `%${params.q}%`)

  const { data } = await query
  const all = data ?? []
  const today = new Date()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <SectionHeader
        title="Colaboradores"
        description={`${all.length} registro(s) encontrado(s)`}
        action={
          <Link href="/collaborators/new" className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
            + Novo colaborador
          </Link>
        }
      />

      <CollaboratorsFilters />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Colaborador</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Cargo</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Equipe</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Tempo</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Salário</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Última promoção</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {all.map(c => {
                const lastPromo = c.last_promotion_date || c.admission_date
                const monthsSincePromo = differenceInMonths(today, parseISO(lastPromo))
                const promoAlert = monthsSincePromo >= 18

                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{c.name}</p>
                          <p className="text-xs text-slate-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Badge variant={c.macro_role === 'junior' ? 'amber' : c.macro_role === 'pleno' ? 'blue' : 'purple'}>
                          {MACRO_LABELS[c.macro_role as keyof typeof MACRO_LABELS]}
                        </Badge>
                        <span className="text-xs text-slate-500 hidden xl:inline">{c.full_title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">{c.team}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 hidden lg:table-cell">{calcTenure(c.admission_date)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-700 hidden lg:table-cell">{fmtCurrency(c.current_salary)}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={promoAlert ? 'text-amber-600 text-xs font-medium' : 'text-xs text-slate-400'}>
                        {promoAlert && '⚠ '}{monthsSincePromo}m atrás
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        c.status === 'active'     ? 'green' :
                        c.status === 'vacation'   ? 'blue' :
                        c.status === 'leave'      ? 'amber' : 'red'
                      }>
                        {STATUS_LABELS[c.status as keyof typeof STATUS_LABELS]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/collaborators/${c.id}`} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                        Ver →
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {all.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-slate-400 text-sm py-12">
                    Nenhum colaborador encontrado com os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
