'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react'

interface Props {
  teams: string[]
}

const MACRO_LABELS = { junior: 'Júnior', pleno: 'Pleno', senior: 'Sênior' }
const STATUS_LABELS = { active: 'Ativo', vacation: 'Férias', leave: 'Afastado', terminated: 'Desligado' }
const PROMO_LABELS  = { '6': '> 6 meses', '12': '> 12 meses', '18': '> 18 meses', '24': '> 24 meses' }
const SALARY_LABELS: Record<string, string> = {
  '0-3000': 'Até R$3.000',
  '3000-6000': 'R$3.000 – R$6.000',
  '6000-10000': 'R$6.000 – R$10.000',
  '10000-': 'Acima de R$10.000',
}

const FILTER_LABELS: Record<string, Record<string, string>> = {
  macro:  MACRO_LABELS,
  status: STATUS_LABELS,
  promo:  PROMO_LABELS,
  salary: SALARY_LABELS,
}

export default function CollaboratorsFilters({ teams }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [localQ, setLocalQ] = useState(searchParams.get('q') ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const update = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  // Debounced search — fires 350ms after user stops typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const current = searchParams.get('q') ?? ''
      if (localQ !== current) update({ q: localQ })
    }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localQ])

  // Compute active filter chips (exclude 'q' — shown in search input)
  const activeFilters: { key: string; label: string; value: string }[] = []
  for (const [key, labelMap] of Object.entries(FILTER_LABELS)) {
    const val = searchParams.get(key)
    if (val && labelMap[val]) {
      activeFilters.push({ key, label: labelMap[val], value: val })
    }
  }
  const teamVal = searchParams.get('team')
  if (teamVal) activeFilters.push({ key: 'team', label: teamVal, value: teamVal })

  const levelVal = searchParams.get('level')
  if (levelVal) activeFilters.push({ key: 'level', label: `Nível ${levelVal}`, value: levelVal })

  const hasFilters = searchParams.toString().length > 0

  const select = (key: string) => (e: React.ChangeEvent<HTMLSelectElement>) => update({ [key]: e.target.value })

  const cls = 'text-sm border border-slate-300 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[130px]'

  return (
    <div className="space-y-3">
      {/* Row 1: search + basic filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Nome, e-mail, equipe ou gestor..."
            value={localQ}
            onChange={e => setLocalQ(e.target.value)}
            className="w-full pl-8 pr-8 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          {localQ && (
            <button
              onClick={() => { setLocalQ(''); update({ q: '' }) }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select value={searchParams.get('macro') ?? ''} onChange={select('macro')} className={cls}>
          <option value="">Todos os cargos</option>
          <option value="junior">Júnior</option>
          <option value="pleno">Pleno</option>
          <option value="senior">Sênior</option>
        </select>

        <select value={searchParams.get('status') ?? ''} onChange={select('status')} className={cls}>
          <option value="">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="vacation">Férias</option>
          <option value="leave">Afastado</option>
          <option value="terminated">Desligado</option>
        </select>

        {/* Advanced toggle */}
        <button
          onClick={() => setShowAdvanced(s => !s)}
          className={`flex items-center gap-1.5 text-sm px-2.5 py-2 rounded-lg border transition-colors ${showAdvanced ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filtros
          {activeFilters.length > 0 && (
            <span className="bg-slate-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {activeFilters.length}
            </span>
          )}
          <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {hasFilters && (
          <button
            onClick={() => { setLocalQ(''); router.push(pathname) }}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-500 px-2 py-2 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Limpar
          </button>
        )}
      </div>

      {/* Row 2: advanced filters (collapsible) */}
      {showAdvanced && (
        <div className="flex flex-wrap gap-2 items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
          <select value={searchParams.get('level') ?? ''} onChange={select('level')} className={cls}>
            <option value="">Todos os níveis</option>
            {[1, 2, 3, 4].map(l => <option key={l} value={l}>Nível {l}</option>)}
          </select>

          {teams.length > 0 && (
            <select value={searchParams.get('team') ?? ''} onChange={select('team')} className={cls}>
              <option value="">Todas as equipes</option>
              {teams.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}

          <select value={searchParams.get('promo') ?? ''} onChange={select('promo')} className={cls}>
            <option value="">Qualquer tempo s/ promoção</option>
            <option value="6">Sem promoção &gt; 6 meses</option>
            <option value="12">Sem promoção &gt; 12 meses</option>
            <option value="18">Sem promoção &gt; 18 meses</option>
            <option value="24">Sem promoção &gt; 24 meses</option>
          </select>

          <select value={searchParams.get('salary') ?? ''} onChange={select('salary')} className={cls}>
            <option value="">Qualquer salário</option>
            <option value="0-3000">Até R$3.000</option>
            <option value="3000-6000">R$3.000 – R$6.000</option>
            <option value="6000-10000">R$6.000 – R$10.000</option>
            <option value="10000-">Acima de R$10.000</option>
          </select>
        </div>
      )}

      {/* Active filter chips */}
      {(activeFilters.length > 0 || (searchParams.get('q') ?? '').length > 0) && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-slate-500">Filtros ativos:</span>
          {(searchParams.get('q') ?? '').length > 0 && (
            <button
              onClick={() => { setLocalQ(''); update({ q: '' }) }}
              className="inline-flex items-center gap-1 text-xs bg-slate-800 text-white px-2 py-1 rounded-full hover:bg-slate-700 transition-colors"
            >
              Busca: &ldquo;{searchParams.get('q')}&rdquo;
              <X className="w-2.5 h-2.5" />
            </button>
          )}
          {activeFilters.map(f => (
            <button
              key={f.key}
              onClick={() => update({ [f.key]: '' })}
              className="inline-flex items-center gap-1 text-xs bg-slate-900 text-white px-2 py-1 rounded-full hover:bg-slate-800 transition-colors"
            >
              {f.label}
              <X className="w-2.5 h-2.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
