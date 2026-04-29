'use client'

import { useRef, useState, useTransition } from 'react'
import { bulkImportCollaborators, type CSVRow } from '@/app/actions/collaborators'
import { MACRO_LABELS } from '@/lib/utils'
import type { MacroRole, GridLevel, CollaboratorStatus } from '@/types'

const VALID_MACRO_ROLES: MacroRole[] = ['junior', 'pleno', 'senior']
const VALID_STATUSES: CollaboratorStatus[] = ['active', 'vacation', 'leave', 'terminated']
const VALID_LEVELS: GridLevel[] = [1, 2, 3, 4]

// CSV columns: name,email,macro_role,grid_level,team,manager,admission_date,current_salary,status,notes
const REQUIRED_HEADERS = ['name', 'email', 'macro_role', 'grid_level', 'team', 'admission_date', 'current_salary', 'status']

interface ParsedRow extends CSVRow { _line: number }
interface ParseError { line: number; message: string }

function parseCSV(text: string): { rows: ParsedRow[]; errors: ParseError[] } {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return { rows: [], errors: [{ line: 0, message: 'Arquivo vazio ou sem dados' }] }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''))
  const missing = REQUIRED_HEADERS.filter(h => !headers.includes(h))
  if (missing.length > 0) {
    return { rows: [], errors: [{ line: 1, message: `Colunas obrigatórias faltando: ${missing.join(', ')}` }] }
  }

  const rows: ParsedRow[] = []
  const errors: ParseError[] = []

  for (let i = 1; i < lines.length; i++) {
    const lineNum = i + 1
    // Simple CSV parse (handles quoted fields with commas)
    const values: string[] = []
    let current = ''
    let inQuotes = false
    for (const char of lines[i]) {
      if (char === '"') { inQuotes = !inQuotes }
      else if (char === ',' && !inQuotes) { values.push(current.trim()); current = '' }
      else { current += char }
    }
    values.push(current.trim())

    const get = (col: string) => {
      const idx = headers.indexOf(col)
      return idx >= 0 ? (values[idx] ?? '').replace(/^"|"$/g, '').trim() : ''
    }

    const name = get('name')
    const email = get('email')
    const macroRaw = get('macro_role').toLowerCase()
    const levelRaw = parseInt(get('grid_level'))
    const team = get('team')
    const manager = get('manager')
    const admissionDate = get('admission_date')
    const salaryRaw = parseFloat(get('current_salary').replace(',', '.'))
    const statusRaw = get('status').toLowerCase()
    const notes = get('notes')

    if (!name) { errors.push({ line: lineNum, message: 'Nome obrigatório' }); continue }
    if (!email || !email.includes('@')) { errors.push({ line: lineNum, message: `E-mail inválido: "${email}"` }); continue }
    if (!VALID_MACRO_ROLES.includes(macroRaw as MacroRole)) {
      errors.push({ line: lineNum, message: `macro_role inválido: "${macroRaw}" (use: junior, pleno, senior)` }); continue
    }
    if (!VALID_LEVELS.includes(levelRaw as GridLevel)) {
      errors.push({ line: lineNum, message: `grid_level inválido: "${get('grid_level')}" (use: 1, 2, 3 ou 4)` }); continue
    }
    if (!team) { errors.push({ line: lineNum, message: 'Equipe obrigatória' }); continue }
    if (!admissionDate || !/^\d{4}-\d{2}-\d{2}$/.test(admissionDate)) {
      errors.push({ line: lineNum, message: `Data de admissão inválida: "${admissionDate}" (use formato YYYY-MM-DD)` }); continue
    }
    if (isNaN(salaryRaw) || salaryRaw <= 0) {
      errors.push({ line: lineNum, message: `Salário inválido: "${get('current_salary')}"` }); continue
    }
    const status: CollaboratorStatus = VALID_STATUSES.includes(statusRaw as CollaboratorStatus)
      ? (statusRaw as CollaboratorStatus)
      : 'active'

    rows.push({
      _line: lineNum,
      name,
      email,
      macro_role: macroRaw as MacroRole,
      grid_level: levelRaw as GridLevel,
      team,
      manager,
      admission_date: admissionDate,
      current_salary: salaryRaw,
      status,
      notes: notes || undefined,
    })
  }

  return { rows, errors }
}

export default function CSVImport() {
  const [open, setOpen] = useState(false)
  const [parsed, setParsed] = useState<ParsedRow[]>([])
  const [errors, setErrors] = useState<ParseError[]>([])
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ inserted: number } | null>(null)
  const [actionError, setActionError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      const { rows, errors: errs } = parseCSV(text)
      setParsed(rows)
      setErrors(errs)
      setResult(null)
      setActionError('')
    }
    reader.readAsText(file, 'UTF-8')
  }

  function handleImport() {
    if (parsed.length === 0) return
    setActionError('')
    startTransition(async () => {
      try {
        const res = await bulkImportCollaborators(parsed)
        setResult(res)
        setParsed([])
        setErrors([])
        if (fileRef.current) fileRef.current.value = ''
      } catch (err) {
        setActionError(String(err))
      }
    })
  }

  function handleClose() {
    setOpen(false)
    setParsed([])
    setErrors([])
    setResult(null)
    setActionError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const inputCls = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
      >
        ↑ Importar CSV
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) handleClose() }}
        >
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-800">Importação em massa (CSV)</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Colunas: name, email, macro_role, grid_level, team, manager, admission_date, current_salary, status, notes
                </p>
              </div>
              <button onClick={handleClose} className="text-slate-400 hover:text-slate-700 text-lg leading-none">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {/* Template download hint */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-xs text-blue-700">
                <strong>Formato esperado:</strong> arquivo .csv com cabeçalho na primeira linha.<br />
                macro_role: <code>junior</code> | <code>pleno</code> | <code>senior</code> &nbsp;·&nbsp;
                grid_level: <code>1</code> | <code>2</code> | <code>3</code> | <code>4</code> &nbsp;·&nbsp;
                admission_date: <code>YYYY-MM-DD</code> &nbsp;·&nbsp;
                status: <code>active</code> | <code>vacation</code> | <code>leave</code> | <code>terminated</code>
              </div>

              {/* File input */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Selecionar arquivo CSV</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFile}
                  className={inputCls}
                />
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-700 mb-1.5">Erros encontrados ({errors.length}):</p>
                  <ul className="space-y-1">
                    {errors.map((e, i) => (
                      <li key={i} className="text-xs text-red-600">Linha {e.line}: {e.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview */}
              {parsed.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">{parsed.length} registro(s) válido(s) para importar:</p>
                  <div className="border border-slate-200 rounded-lg overflow-auto max-h-48">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-3 py-2 text-left font-medium text-slate-500">Linha</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-500">Nome</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-500">E-mail</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-500">Cargo</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-500">Equipe</th>
                          <th className="px-3 py-2 text-right font-medium text-slate-500">Salário</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsed.map(row => (
                          <tr key={row._line} className="hover:bg-slate-50">
                            <td className="px-3 py-1.5 text-slate-400">{row._line}</td>
                            <td className="px-3 py-1.5 text-slate-700 font-medium">{row.name}</td>
                            <td className="px-3 py-1.5 text-slate-500">{row.email}</td>
                            <td className="px-3 py-1.5 text-slate-600">{MACRO_LABELS[row.macro_role]} {row.grid_level}</td>
                            <td className="px-3 py-1.5 text-slate-500 truncate max-w-[120px]">{row.team}</td>
                            <td className="px-3 py-1.5 text-right text-slate-700">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.current_salary)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Success */}
              {result && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-700 font-medium">
                  ✓ {result.inserted} colaborador(es) importado(s) com sucesso!
                </div>
              )}

              {actionError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                  {actionError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <a
                href="data:text/csv;charset=utf-8,name,email,macro_role,grid_level,team,manager,admission_date,current_salary,status,notes%0AJoão Silva,joao@empresa.com,junior,1,Suporte ao Cliente,Maria Gestora,2024-01-15,3200,active,%0AMaria Santos,maria@empresa.com,pleno,2,Produtos,Carlos Silva,2022-06-01,6500,active,Ótima performance"
                download="modelo_importacao.csv"
                className="text-xs text-blue-600 hover:underline"
              >
                ↓ Baixar modelo CSV
              </a>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-sm px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={parsed.length === 0 || isPending}
                  className="text-sm bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50"
                >
                  {isPending ? 'Importando...' : `Importar ${parsed.length > 0 ? `(${parsed.length})` : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
