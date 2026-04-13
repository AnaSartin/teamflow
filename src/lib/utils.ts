import {
  differenceInDays,
  differenceInMonths,
  addYears,
  format,
  parseISO,
  isAfter,
  isBefore,
  addDays,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Collaborator, CollaboratorWithMeta, MacroRole, GridLevel, VacationStatus } from '@/types'

// ─── Labels ──────────────────────────────────────────────────────────────────

export const MACRO_LABELS: Record<MacroRole, string> = {
  junior: 'Júnior',
  pleno: 'Pleno',
  senior: 'Sênior',
}

export const STATUS_LABELS = {
  active: 'Ativo',
  vacation: 'Férias',
  leave: 'Afastado',
  terminated: 'Desligado',
} as const

export const VACATION_STATUS_LABELS: Record<VacationStatus, string> = {
  not_scheduled: 'Não agendada',
  scheduled: 'Agendada',
  ongoing: 'Em andamento',
  completed: 'Concluída',
  expired: 'Vencida',
}

// ─── Title builder ────────────────────────────────────────────────────────────

export function buildTitle(macro: MacroRole, level: GridLevel): string {
  return `Analista de Suporte ${MACRO_LABELS[macro]} ${level}`
}

// ─── Tenure ───────────────────────────────────────────────────────────────────

export function calcTenure(admDate: string): string {
  const adm = parseISO(admDate)
  const now = new Date()
  const totalMonths = differenceInMonths(now, adm)
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  if (years === 0) return `${months}m`
  return `${years}a ${months}m`
}

// ─── Vacation logic ───────────────────────────────────────────────────────────

/** Retorna a data de vencimento das férias do período aquisitivo dado.
 * Regra CLT: vence 12 meses após o fim do período aquisitivo (1 ano de empresa).
 */
export function calcVacationExpiry(acquisitionStart: string): string {
  const start = parseISO(acquisitionStart)
  const acquisitionEnd = addYears(start, 1)
  const expiry = addYears(acquisitionEnd, 1)
  return format(expiry, 'yyyy-MM-dd')
}

export function daysUntilExpiry(expiryDate: string): number {
  return differenceInDays(parseISO(expiryDate), new Date())
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export function fmtDate(date: string | null | undefined): string {
  if (!date) return '—'
  return format(parseISO(date), 'dd/MM/yyyy', { locale: ptBR })
}

export function fmtCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function fmtMonths(months: number): string {
  if (months < 12) return `${months}m`
  const y = Math.floor(months / 12)
  const m = months % 12
  return m > 0 ? `${y}a ${m}m` : `${y}a`
}

// ─── Enrich collaborator with computed fields ─────────────────────────────────

export function enrichCollaborator(c: Collaborator): CollaboratorWithMeta {
  const today = new Date()
  const lastPromo = c.last_promotion_date ? parseISO(c.last_promotion_date) : parseISO(c.admission_date)
  const lastRaise = c.last_raise_date ? parseISO(c.last_raise_date) : parseISO(c.admission_date)

  return {
    ...c,
    tenure_text: calcTenure(c.admission_date),
    months_since_promotion: differenceInMonths(today, lastPromo),
    months_since_raise: differenceInMonths(today, lastRaise),
  }
}

// ─── Salary grid default values ───────────────────────────────────────────────

export const DEFAULT_SALARY_GRID: Array<{
  macro_role: MacroRole
  grid_level: GridLevel
  salary_min: number
  salary_max: number
}> = [
  { macro_role: 'junior', grid_level: 1, salary_min: 2800, salary_max: 3200 },
  { macro_role: 'junior', grid_level: 2, salary_min: 3200, salary_max: 3700 },
  { macro_role: 'junior', grid_level: 3, salary_min: 3700, salary_max: 4300 },
  { macro_role: 'junior', grid_level: 4, salary_min: 4300, salary_max: 5000 },
  { macro_role: 'pleno',  grid_level: 1, salary_min: 5000, salary_max: 5800 },
  { macro_role: 'pleno',  grid_level: 2, salary_min: 5800, salary_max: 6700 },
  { macro_role: 'pleno',  grid_level: 3, salary_min: 6700, salary_max: 7700 },
  { macro_role: 'pleno',  grid_level: 4, salary_min: 7700, salary_max: 9000 },
  { macro_role: 'senior', grid_level: 1, salary_min: 9000,  salary_max: 10500 },
  { macro_role: 'senior', grid_level: 2, salary_min: 10500, salary_max: 12000 },
  { macro_role: 'senior', grid_level: 3, salary_min: 12000, salary_max: 13800 },
  { macro_role: 'senior', grid_level: 4, salary_min: 13800, salary_max: 16000 },
]

// ─── Avatar initials + color ──────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
]

export function avatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

export function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}
