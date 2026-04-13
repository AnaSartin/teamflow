import { cn } from '@/lib/cn'
import { initials, avatarColor } from '@/lib/utils'

// ─── Badge ────────────────────────────────────────────────────────────────────

type BadgeVariant = 'green' | 'red' | 'amber' | 'blue' | 'purple' | 'gray'

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  green:  'bg-emerald-50  text-emerald-700  border-emerald-200',
  red:    'bg-red-50      text-red-700      border-red-200',
  amber:  'bg-amber-50    text-amber-700    border-amber-200',
  blue:   'bg-blue-50     text-blue-700     border-blue-200',
  purple: 'bg-purple-50   text-purple-700   border-purple-200',
  gray:   'bg-slate-100   text-slate-600    border-slate-200',
}

export function Badge({ variant = 'gray', children, className }: {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', BADGE_CLASSES[variant], className)}>
      {children}
    </span>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

export function StatCard({ label, value, sub, accent }: {
  label: string
  value: string | number
  sub?: string
  accent?: 'red' | 'amber' | 'green' | 'blue'
}) {
  const accentMap = {
    red:   'border-l-red-400    bg-red-50',
    amber: 'border-l-amber-400  bg-amber-50',
    green: 'border-l-emerald-400 bg-emerald-50',
    blue:  'border-l-blue-400   bg-blue-50',
  }

  return (
    <div className={cn(
      'bg-white rounded-xl border border-slate-200 p-4',
      accent ? `border-l-4 ${accentMap[accent]}` : ''
    )}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">{label}</p>
      <p className="text-2xl font-semibold text-slate-900 tracking-tight">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = { sm: 'w-7 h-7 text-xs', md: 'w-8 h-8 text-sm', lg: 'w-10 h-10 text-base' }[size]
  return (
    <div className={cn('rounded-full flex items-center justify-center font-semibold shrink-0', sizeClass, avatarColor(name))}>
      {initials(name)}
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

export function SectionHeader({ title, description, action }: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

export function Empty({ message }: { message: string }) {
  return (
    <div className="text-center py-12 text-slate-400 text-sm">{message}</div>
  )
}

// ─── Alert banner ─────────────────────────────────────────────────────────────

export function AlertBanner({ type, children }: {
  type: 'error' | 'warning' | 'info'
  children: React.ReactNode
}) {
  const map = {
    error:   'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info:    'bg-blue-50 border-blue-200 text-blue-800',
  }
  return (
    <div className={cn('flex items-start gap-2 text-sm border rounded-lg px-3.5 py-3 mb-4', map[type])}>
      <span className="mt-0.5">{type === 'error' ? '⚠' : type === 'warning' ? '⚠' : 'ℹ'}</span>
      <span>{children}</span>
    </div>
  )
}
