'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Grid3X3,
  CalendarDays,
  Settings,
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
    <aside className="w-56 bg-[#0F1117] flex flex-col shrink-0 h-full">
      {/* Logo / brand */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center shrink-0">
            <span className="text-[#0F1117] font-black text-xs tracking-tighter">TF</span>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white leading-none tracking-tight">TeamFlow</p>
            <p className="text-[11px] text-white/30 mt-0.5 font-normal">
              {process.env.NEXT_PUBLIC_COMPANY_NAME ?? 'Gestão de Pessoas'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        <p className="px-2 pb-2 text-[10px] font-semibold text-white/20 uppercase tracking-widest">
          Módulos
        </p>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150',
                active
                  ? 'bg-white text-[#0F1117] font-semibold shadow-sm'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/[0.06] font-medium'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-[#0F1117]' : '')} />
              <span className="flex-1 leading-none">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-white/[0.06]">
        <p className="text-[10px] text-white/20 font-medium tracking-wide">v2.0 · Adaptive</p>
      </div>
    </aside>
  )
}
