'use client'

import { useState, useTransition } from 'react'
import { createGridPosition } from '@/app/actions/grid'

const MACRO_SUGGESTIONS = [
  { value: 'junior', label: 'Júnior' },
  { value: 'pleno', label: 'Pleno' },
  { value: 'senior', label: 'Sênior' },
  { value: 'especialista', label: 'Especialista' },
  { value: 'coordenador', label: 'Coordenador' },
  { value: 'gerente', label: 'Gerente' },
]

export default function GridCreateModal() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [macroRole, setMacroRole] = useState('')
  const [customMacro, setCustomMacro] = useState('')
  const [gridLevel, setGridLevel] = useState(1)
  const [fullTitle, setFullTitle] = useState('')
  const [autoTitle, setAutoTitle] = useState(true)

  const effectiveMacro = macroRole === '__custom__' ? customMacro : macroRole

  function getAutoTitle(macro: string, level: number): string {
    const label = MACRO_SUGGESTIONS.find(s => s.value === macro)?.label
      ?? (macro ? macro.charAt(0).toUpperCase() + macro.slice(1) : '')
    return label ? `${label} ${level}` : ''
  }

  function handleMacroChange(value: string) {
    setMacroRole(value)
    if (autoTitle && value !== '__custom__') {
      setFullTitle(getAutoTitle(value, gridLevel))
    }
  }

  function handleLevelChange(level: number) {
    setGridLevel(level)
    if (autoTitle) {
      setFullTitle(getAutoTitle(effectiveMacro, level))
    }
  }

  function handleTitleChange(val: string) {
    setFullTitle(val)
    setAutoTitle(false)
  }

  function handleOpen() {
    setMacroRole('')
    setCustomMacro('')
    setGridLevel(1)
    setFullTitle('')
    setAutoTitle(true)
    setError('')
    setOpen(true)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const fd = new FormData(e.currentTarget)
    const salary_min = parseFloat(fd.get('salary_min') as string)
    const salary_max = parseFloat(fd.get('salary_max') as string)
    const notes = (fd.get('notes') as string).trim()

    if (!effectiveMacro.trim()) { setError('Selecione ou informe o cargo macro.'); return }
    if (!fullTitle.trim()) { setError('Informe o título do cargo.'); return }
    if (!Number.isFinite(salary_min) || salary_min <= 0) { setError('Salário mínimo inválido.'); return }
    if (!Number.isFinite(salary_max) || salary_max <= 0) { setError('Salário máximo inválido.'); return }
    if (salary_max <= salary_min) { setError('O máximo deve ser maior que o mínimo.'); return }

    startTransition(async () => {
      const result = await createGridPosition({
        macro_role: effectiveMacro,
        grid_level: gridLevel,
        full_title: fullTitle,
        salary_min,
        salary_max,
        notes,
      })
      if (result?.error) setError(result.error)
      else { setOpen(false) }
    })
  }

  const inputCls = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
      >
        + Novo cargo
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-800 mb-1">Novo cargo na grelha</h3>
            <p className="text-sm text-slate-500 mb-4">Crie uma nova posição com faixa salarial personalizada.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Cargo macro */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Cargo macro *</label>
                <select
                  value={macroRole}
                  onChange={e => handleMacroChange(e.target.value)}
                  className={inputCls}
                  required
                >
                  <option value="">Selecione...</option>
                  {MACRO_SUGGESTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                  <option value="__custom__">Outro (digitar)</option>
                </select>
                {macroRole === '__custom__' && (
                  <input
                    type="text"
                    value={customMacro}
                    onChange={e => {
                      setCustomMacro(e.target.value)
                      if (autoTitle) setFullTitle(getAutoTitle(e.target.value, gridLevel))
                    }}
                    placeholder="Ex: Consultor, Técnico..."
                    className={`${inputCls} mt-2`}
                    autoFocus
                  />
                )}
              </div>

              {/* Nível */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nível *</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={gridLevel}
                  onChange={e => handleLevelChange(parseInt(e.target.value) || 1)}
                  className={inputCls}
                  required
                />
                <p className="text-xs text-slate-400 mt-1">Use números sequenciais (1, 2, 3…) para cada nível do cargo.</p>
              </div>

              {/* Título completo */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Título completo *
                  {autoTitle && <span className="text-slate-400 ml-1">(gerado automaticamente)</span>}
                </label>
                <input
                  type="text"
                  value={fullTitle}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="Ex: Especialista em Suporte 1"
                  className={inputCls}
                  required
                />
              </div>

              {/* Faixas salariais */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Salário mínimo (R$) *</label>
                  <input
                    name="salary_min"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0,00"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Salário máximo (R$) *</label>
                  <input
                    name="salary_max"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0,00"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Observação */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Observação</label>
                <input
                  name="notes"
                  type="text"
                  placeholder="Opcional..."
                  className={inputCls}
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-sm px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {isPending ? 'Criando...' : 'Criar cargo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
