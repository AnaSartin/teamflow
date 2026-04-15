import { createClient } from '@/lib/supabase/server'
import { SectionHeader, Badge } from '@/components/ui'
import { fmtCurrency, MACRO_LABELS } from '@/lib/utils'
import type { MacroRole, GridLevel } from '@/types'
import GridEditModal from '@/components/grid/GridEditModal'

export default async function GridPage() {
  const supabase = await createClient()
  const { data: grid } = await supabase
    .from('salary_grid')
    .select('*')
    .order('macro_role')
    .order('grid_level')

  const { data: collaborators } = await supabase
    .from('collaborators')
    .select('macro_role, grid_level, current_salary')
    .neq('status', 'terminated')

  const rows = grid ?? []

  // Count collaborators per position
  const counts: Record<string, number> = {}
  for (const c of collaborators ?? []) {
    const key = `${c.macro_role}-${c.grid_level}`
    counts[key] = (counts[key] ?? 0) + 1
  }

  const macroVariant = { junior: 'amber' as const, pleno: 'blue' as const, senior: 'purple' as const }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <SectionHeader
        title="Grelha Salarial"
        description="Estrutura de cargos e faixas salariais. Atualize conforme política interna."
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Cargo</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Nível</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Nome completo</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Faixa mín.</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Faixa máx.</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Colaboradores</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Obs.</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(row => {
                const key = `${row.macro_role}-${row.grid_level}`
                const count = counts[key] ?? 0
                return (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Badge variant={macroVariant[row.macro_role as keyof typeof macroVariant]}>
                        {MACRO_LABELS[row.macro_role as MacroRole]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-700">N{row.grid_level}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{row.full_title}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-emerald-700">{fmtCurrency(row.salary_min)}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-blue-700">{fmtCurrency(row.salary_max)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                        {count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 max-w-[160px] truncate">{row.notes ?? '—'}</td>
                    <td className="px-4 py-3">
                      <GridEditModal row={{ id: row.id, full_title: row.full_title, salary_min: row.salary_min, salary_max: row.salary_max, notes: row.notes }} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Occupancy chart */}
      <h2 className="text-sm font-semibold text-slate-700 mb-3">Ocupação por nível</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {(['junior', 'pleno', 'senior'] as MacroRole[]).map(macro => {
          const total = (collaborators ?? []).filter(c => c.macro_role === macro).length
          return (
            <div key={macro} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <Badge variant={macroVariant[macro]}>{MACRO_LABELS[macro]}</Badge>
                <span className="text-sm font-semibold text-slate-700">{total} total</span>
              </div>
              <div className="space-y-2">
                {([1, 2, 3, 4] as GridLevel[]).map(level => {
                  const count = counts[`${macro}-${level}`] ?? 0
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0
                  return (
                    <div key={level}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500">Nível {level}</span>
                        <span className="font-medium text-slate-700">{count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
