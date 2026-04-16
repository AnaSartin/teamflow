import { createClient } from '@/lib/supabase/server'
import { SectionHeader, Badge } from '@/components/ui'
import { fmtCurrency } from '@/lib/utils'
import type { MacroRole, GridLevel } from '@/types'
import GridEditModal from '@/components/grid/GridEditModal'
import GridCreateModal from '@/components/grid/GridCreateModal'
import GridDeleteButton from '@/components/grid/GridDeleteButton'

// Standard roles get a color badge; custom roles get a neutral badge
function getMacroVariant(macro: string): 'amber' | 'blue' | 'purple' | 'gray' {
  const MAP: Record<string, 'amber' | 'blue' | 'purple'> = {
    junior: 'amber',
    pleno: 'blue',
    senior: 'purple',
  }
  return MAP[macro] ?? 'gray'
}

function getMacroLabel(macro: string): string {
  const LABELS: Record<string, string> = {
    junior: 'Júnior',
    pleno: 'Pleno',
    senior: 'Sênior',
  }
  return LABELS[macro] ?? (macro.charAt(0).toUpperCase() + macro.slice(1))
}

export default async function GridPage() {
  const supabase = await createClient()

  const [{ data: grid }, { data: collaborators }] = await Promise.all([
    supabase
      .from('salary_grid')
      .select('*')
      .order('macro_role')
      .order('grid_level'),
    supabase
      .from('collaborators')
      .select('macro_role, grid_level, current_salary')
      .neq('status', 'terminated'),
  ])

  const rows = grid ?? []

  // Count collaborators per position
  const counts: Record<string, number> = {}
  for (const c of collaborators ?? []) {
    const key = `${c.macro_role}-${c.grid_level}`
    counts[key] = (counts[key] ?? 0) + 1
  }

  // Group grid rows by macro_role for the occupancy chart
  const macroGroups = [...new Set(rows.map(r => r.macro_role))]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <SectionHeader
          title="Grelha Salarial"
          description="Estrutura de cargos e faixas salariais. Crie, edite ou exclua conforme política interna."
        />
        <GridCreateModal />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Cargo</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Nível</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Título</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Faixa mín.</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Faixa máx.</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Colaboradores</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Obs.</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-sm text-slate-400 py-8">
                    Nenhum cargo cadastrado. Clique em &quot;+ Novo cargo&quot; para começar.
                  </td>
                </tr>
              )}
              {rows.map(row => {
                const key = `${row.macro_role}-${row.grid_level}`
                const count = counts[key] ?? 0
                const variant = getMacroVariant(row.macro_role)
                return (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Badge variant={variant}>
                        {getMacroLabel(row.macro_role)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-700">N{row.grid_level}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{row.full_title}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-emerald-700">{fmtCurrency(row.salary_min)}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-blue-700">{fmtCurrency(row.salary_max)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${count > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                        {count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 max-w-[140px] truncate">{row.notes ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <GridEditModal
                          row={{
                            id: row.id,
                            full_title: row.full_title,
                            salary_min: row.salary_min,
                            salary_max: row.salary_max,
                            notes: row.notes,
                          }}
                        />
                        <GridDeleteButton id={row.id} title={row.full_title} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Occupancy chart — only for groups that have grid rows */}
      {macroGroups.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Ocupação por grupo</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {macroGroups.map(macro => {
              const macroRows = rows.filter(r => r.macro_role === macro)
              const total = (collaborators ?? []).filter(c => c.macro_role === macro).length
              return (
                <div key={macro} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={getMacroVariant(macro)}>{getMacroLabel(macro)}</Badge>
                    <span className="text-sm font-semibold text-slate-700">{total} total</span>
                  </div>
                  <div className="space-y-2">
                    {macroRows.map(row => {
                      const count = counts[`${macro}-${row.grid_level}`] ?? 0
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0
                      return (
                        <div key={row.grid_level}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-500">N{row.grid_level}</span>
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
        </>
      )}
    </div>
  )
}
