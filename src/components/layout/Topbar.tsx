'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { initials, avatarColor } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'
import AlertsPanel from './AlertsPanel'
import type { AlertItem } from './AlertsPanel'

export default function Topbar({ user, alerts }: { user: User; alerts: AlertItem[] }) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const email = user.email ?? ''
  const displayName = email.split('@')[0].replace('.', ' ')
  const color = avatarColor(displayName)

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2">
        {/* intentionally empty — pages use h1 */}
      </div>

      <div className="flex items-center gap-3">
        <AlertsPanel alerts={alerts} />

        <div className="w-px h-5 bg-slate-200" />

        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${color}`}>
            {initials(displayName)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800 leading-none capitalize">{displayName}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Sair"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
