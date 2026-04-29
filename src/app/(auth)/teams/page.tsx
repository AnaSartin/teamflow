import { createClient } from '@/lib/supabase/server'
import { SectionHeader } from '@/components/ui'
import { TeamCreateModal, TeamEditModal, TeamDeleteButton } from '@/components/teams/TeamModal'

const TEAM_LEVEL_LABELS: Record<string, string> = {
  N1: 'N1',
  N2: 'N2',
  Coordenação: 'Coordenação',
}

export default async function TeamsPage() {
  const supabase = await createClient()

  const [{ data: teams }, { data: collaborators }] = await Promise.all([
    supabase.from('teams').select('*').order('name'),
    supabase
      .from('collaborators')
      .select('team_id, team_level, macro_role, status')
      .neq('status', 'terminated'),
  ])

  const teamList = teams ?? []
  const collabList = collaborators ?? []

  // Count collaborators per team + per level
  const countByTeam: Record<string, number> = {}
  const countByTeamLevel: Record<string, Record<string, number>> = {}

  for (const c of collabList) {
    if (!c.team_id) continue
    countByTeam[c.team_id] = (countByTeam[c.team_id] ?? 0) + 1
    if (!countByTeamLevel[c.team_id]) countByTeamLevel[c.team_id] = {}
    const lvl = c.team_level ?? 'Sem nível'
    countByTeamLevel[c.team_id][lvl] = (countByTeamLevel[c.team_id][lvl] ?? 0) + 1
  }

  const totalWithoutTeam = collabList.filter(c => !c.team_id).length

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <SectionHeader
          title="Equipes"
          description="Gerencie as equipes da empresa e veja a distribuição de colaboradores por grupo e nível."
        />
        <TeamCreateModal />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Total de equipes</p>
          <p className="text-2xl font-bold text-slate-900">{teamList.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Total ativo</p>
          <p className="text-2xl font-bold text-slate-900">{collabList.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Com equipe vinculada</p>
          <p className="text-2xl font-bold text-slate-900">{collabList.length - totalWithoutTeam}</p>
        </div>
        <div className={`bg-white rounded-xl border p-4 ${totalWithoutTeam > 0 ? 'border-l-4 border-l-amber-400 bg-amber-50' : 'border-slate-200'}`}>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Sem equipe</p>
          <p className={`text-2xl font-bold ${totalWithoutTeam > 0 ? 'text-amber-700' : 'text-slate-900'}`}>{totalWithoutTeam}</p>
        </div>
      </div>

      {/* Teams table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Equipe</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Tipo</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Total</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">N1</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">N2</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Coord.</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teamList.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-sm text-slate-400 py-8">
                    Nenhuma equipe cadastrada. Clique em &quot;+ Nova equipe&quot; para começar.
                  </td>
                </tr>
              )}
              {teamList.map(team => {
                const total = countByTeam[team.id] ?? 0
                const levels = countByTeamLevel[team.id] ?? {}
                return (
                  <tr key={team.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 text-sm">{team.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 capitalize">{team.type ?? '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${total > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                        {total}
                      </span>
                    </td>
                    {['N1', 'N2', 'Coordenação'].map(lvl => (
                      <td key={lvl} className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-medium ${(levels[lvl] ?? 0) > 0 ? 'bg-slate-200 text-slate-700' : 'text-slate-300'}`}>
                          {levels[lvl] ?? 0}
                        </span>
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <TeamEditModal team={team} />
                        <TeamDeleteButton id={team.id} name={team.name} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual distribution */}
      {teamList.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Distribuição por equipe</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {teamList.map(team => {
              const total = countByTeam[team.id] ?? 0
              const levels = countByTeamLevel[team.id] ?? {}
              const grandTotal = collabList.length
              const teamPct = grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0

              return (
                <div key={team.id} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{team.name}</p>
                      {team.type && <p className="text-xs text-slate-400 capitalize">{team.type}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-700">{total}</p>
                      <p className="text-xs text-slate-400">{teamPct}% do time</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {['N1', 'N2', 'Coordenação'].map(lvl => {
                      const count = levels[lvl] ?? 0
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0
                      return (
                        <div key={lvl}>
                          <div className="flex items-center justify-between text-xs mb-0.5">
                            <span className="text-slate-500">{TEAM_LEVEL_LABELS[lvl]}</span>
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
