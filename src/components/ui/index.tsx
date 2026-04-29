import { cn } from '@/lib/cn'
import { initials, avatarColor } from '@/lib/utils'

// ─── Badge ────────────────────────────────────────────────────────────────────

type BadgeVariant = 'green' | 'red' | 'amber' | 'blue' | 'purple' | 'gray'

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  green:  'bg-emerald-50  text-emerald-700  ring-1 ring-emerald-200/80',
  red:    'bg-red-50      text-red-700      ring-1 ring-red-200/80',
  amber:  'bg-amber-50    text-amber-700    ring-1 ring-amber-200/80',
  blue:   'bg-blue-50     text-blue-700     ring-1 ring-blue-200/80',
  purple: 'bg-violet-50   text-violet-700   ring-1 ring-violet-200/80',
  gray:   'bg-slate-100   text-slate-600    ring-1 ring-slate-200/60',
}

export function Badge({ variant = 'gray', children, className }: {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide',
      BADGE_CLASSES[variant],
      className
    )}>
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
    red:   'border-t-2 border-t-red-400',
    amber: 'border-t-2 border-t-amber-400',
    green: 'border-t-2 border-t-emerald-400',
    blue:  'border-t-2 border-t-blue-500',
  }

  return (
    <div className={cn(
      'bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm',
      accent ? accentMap[accent] : ''
    )}>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1.5 font-medium">{sub}</p>}
    </div>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = { sm: 'w-7 h-7 text-xs', md: 'w-8 h-8 text-sm', lg: 'w-11 h-11 text-base' }[size]
  return (
    <div className={cn('rounded-lg flex items-center justify-center font-bold shrink-0', sizeClass, avatarColor(name))}>
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
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-0.5 font-medium">{description}</p>}
      </div>
      {action}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

export function Empty({ message }: { message: string }) {
  return (
    <div className="text-center py-16 text-slate-400 text-sm font-medium">{message}</div>
  )
}

// ─── Alert banner ─────────────────────────────────────────────────────────────

export function AlertBanner({ type, children }: {
  type: 'error' | 'warning' | 'info'
  children: React.ReactNode
}) {
  const map = {
    error:   'bg-red-50 border border-red-200 text-red-800',
    warning: 'bg-amber-50 border border-amber-200 text-amber-800',
    info:    'bg-blue-50 border border-blue-200 text-blue-800',
  }
  const icon = {
    error: '⛔',
    warning: '⚠️',
    info: 'ℹ️',
  }
  return (
    <div className={cn('flex items-start gap-2.5 text-sm rounded-lg px-4 py-3 mb-3', map[type])}>
      <span className="mt-0.5 shrink-0">{icon[type]}</span>
      <span className="font-medium">{children}</span>
    </div>
  )
}
