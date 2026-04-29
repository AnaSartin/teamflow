import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SectionHeader, Badge, Avatar } from '@/components/ui'
import { fmtDate, fmtCurrency, calcTenure, MACRO_LABELS } from '@/lib/utils'
import { differenceInMonths, parseISO } from 'date-fns'
import CollaboratorsFilters from '@/components/collaborators/CollaboratorsFilters'
import CSVImport from '@/components/collaborators/CSVImport'
import QuickStatusSelect from '@/components/collaborators/QuickStatusSelect'
import type { MacroRole, CollaboratorStatus } from '@/types'

export default async function CollaboratorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Fetch distinct teams for filter dropdown
  const { data: teamRows } = await supabase
    .from('collaborators')
    .select('team')
    .neq('status', 'terminated')
    .order('team')
  const teams = [...new Set((teamRows ?? []).map(r => r.team as string).filter(Boolean))].sort()

  // ── Build query ─────────────────────────────────────────────────────────
  let query = supabase.from('collaborators').select('*').order('name')

  // Status filter
  if (params.status) query = query.eq('status', params.status)

  // Macro role filter
  if (params.macro) query = query.eq('macro_role', params.macro)

  // Level filter
  if (params.level) query = query.eq('grid_level', parseInt(params.level))

  // Team exact match (from dropdown)
  if (params.team) query = query.eq('team', params.team)

  // Salary range filter
  if (params.salary) {
    const [minStr, maxStr] = params.salary.split('-')
    const min = parseInt(minStr)
    if (!isNaN(min)) query = query.gte('current_salary', min)
    if (maxStr && maxStr !== '') {
      const max = parseInt(maxStr)
      if (!isNaN(max)) query = query.lte('current_salary', max)
    }
  }

  // Multi-field search: name OR email OR team OR manager
  if (params.q && params.q.trim()) {
    const term = `%${params.q.trim()}%`
    query = query.or(
      `name.ilike.${term},email.ilike.${term},team.ilike.${term},manager.ilike.${term}`
    )
  }

  const { data } = await query
  const today = new Date()
  let all = data ?? []

  // ── Post-filter: promo months (computed, can't do in SQL easily) ────────
  if (params.promo) {
    const minMonths = parseInt(params.promo)
    all = all.filter(c => {
      const lastPromo = c.last_promotion_date || c.admission_date
      return differenceInMonths(today, parseISO(lastPromo)) >= minMonths
    })
  }

  const totalCount = all.length

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <SectionHeader
        title="Colaboradores"
        description={`${totalCount} registro${totalCount !== 1 ? 's' : ''} encontrado${totalCount !== 1 ? 's' : ''}`}
        action={
          <div className="flex items-center gap-2">
            <ExportButton params={params} />
            <CSVImport />
            <Link
              href="/collaborators/new"
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
            >
              + Novo
            </Link>
          </div>
        }
      />

      <CollaboratorsFilters teams={teams} />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Colaborador</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Cargo</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Equipe</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Tempo</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Salário</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3 hidden md:table-cell">S/ promoção</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {all.map(c => {
                const lastPromo = c.last_promotion_date || c.admission_date
                const monthsSincePromo = differenceInMonths(today, parseISO(lastPromo))
                const promoAlert = monthsSincePromo >= 18
                const promoCritical = monthsSincePromo >= 24

                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} />
                        <div>
                          <Link href={`/collaborators/${c.id}`} className="text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors">
                            {c.name}
                          </Link>
                          <p className="text-xs text-slate-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Badge variant={c.macro_role === 'junior' ? 'amber' : c.macro_role === 'pleno' ? 'blue' : 'purple'}>
                          {MACRO_LABELS[c.macro_role as MacroRole]} {c.grid_level}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 hidden xl:block">{c.full_title}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">{c.team}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 hidden lg:table-cell">{calcTenure(c.admission_date)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-700 text-right hidden lg:table-cell">
                      {fmtCurrency(c.current_salary)}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={
                        promoCritical ? 'text-red-600 text-xs font-semibold' :
                        promoAlert    ? 'text-amber-600 text-xs font-medium' :
                        'text-xs text-slate-400'
                      }>
                        {promoCritical ? '🔴 ' : promoAlert ? '⚠ ' : ''}{monthsSincePromo}m
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <QuickStatusSelect id={c.id} currentStatus={c.status as CollaboratorStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/collaborators/${c.id}`}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {all.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-slate-400 text-sm py-16">
                    <p className="text-2xl mb-2">🔍</p>
                    Nenhum colaborador encontrado com os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with count */}
        {all.length > 0 && (
          <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">{all.length} resultado{all.length !== 1 ? 's' : ''}</span>
            <ExportButton params={params} small />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Export button (client-compatible link to API route) ──────────────────────

function ExportButton({ params, small }: { params: Record<string, string>; small?: boolean }) {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v) qs.set(k, v)
  }
  const href = `/api/export/collaborators?${qs.toString()}`

  if (small) {
    return (
      <a href={href} download className="text-xs text-slate-500 hover:text-blue-600 transition-colors">
        ↓ Exportar Excel
      </a>
    )
  }

  return (
    <a
      href={href}
      download
      className="inline-flex items-center gap-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
    >
      ↓ Excel
    </a>
  )
}
