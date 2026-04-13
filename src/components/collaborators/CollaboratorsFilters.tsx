'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Search } from 'lucide-react'

export default function CollaboratorsFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nome..."
          defaultValue={searchParams.get('q') ?? ''}
          onChange={e => update('q', e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      <select
        defaultValue={searchParams.get('macro') ?? ''}
        onChange={e => update('macro', e.target.value)}
        className="text-sm border border-slate-300 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todos os cargos</option>
        <option value="junior">Júnior</option>
        <option value="pleno">Pleno</option>
        <option value="senior">Sênior</option>
      </select>

      <select
        defaultValue={searchParams.get('level') ?? ''}
        onChange={e => update('level', e.target.value)}
        className="text-sm border border-slate-300 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todos os níveis</option>
        {[1, 2, 3, 4].map(l => <option key={l} value={l}>Nível {l}</option>)}
      </select>

      <select
        defaultValue={searchParams.get('status') ?? ''}
        onChange={e => update('status', e.target.value)}
        className="text-sm border border-slate-300 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todos os status</option>
        <option value="active">Ativo</option>
        <option value="vacation">Férias</option>
        <option value="leave">Afastado</option>
        <option value="terminated">Desligado</option>
      </select>

      {searchParams.toString() && (
        <button
          onClick={() => router.push(pathname)}
          className="text-sm text-slate-500 hover:text-red-500 px-2 py-2 transition-colors"
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}
