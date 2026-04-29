'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Grid3X3,
  CalendarDays,
  Settings,
  ChevronRight,
  UsersRound,
} from 'lucide-react'
import { cn } from '@/lib/cn'

const NAV = [
  { href: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/collaborators', icon: Users,            label: 'Colaboradores' },
  { href: '/teams',         icon: UsersRound,       label: 'Equipes' },
  { href: '/grid',          icon: Grid3X3,          label: 'Grelha Salarial' },
  { href: '/vacations',     icon: CalendarDays,     label: 'Agenda de Férias' },
  { href: '/settings',      icon: Settings,         label: 'Configurações' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-slate-900 flex flex-col shrink-0 h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-none">TeamFlow</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{process.env.NEXT_PUBLIC_COMPANY_NAME ?? 'Gestão'}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        <p className="px-3 pt-2 pb-1.5 text-[10px] font-medium text-slate-500 uppercase tracking-wider">Menu</p>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors group',
                active
                  ? 'bg-slate-700 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3 opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-800">
        <p className="text-[11px] text-slate-600">v2.0 · Sistema interno</p>
      </div>
    </aside>
  )
}
