import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { differenceInDays, differenceInMonths, parseISO } from 'date-fns'
import type { AlertItem } from '@/components/layout/AlertsPanel'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Compute alerts for topbar bell
  const { data: collaborators } = await supabase
    .from('collaborators')
    .select('id, name, last_promotion_date, admission_date, vacations(expiry_date, status, scheduled_start)')
    .neq('status', 'terminated')

  const today = new Date()
  const alerts: AlertItem[] = []

  for (const c of collaborators ?? []) {
    // Vacation alerts
    for (const v of (c.vacations as Array<Record<string, string>>) ?? []) {
      if (v.status === 'completed') continue
      const days = differenceInDays(parseISO(v.expiry_date), today)
      if (days < 0) {
        alerts.push({ id: c.id, name: c.name, type: 'vacation_expired', detail: `${Math.abs(days)}d vencidas`, priority: 'critical' })
      } else if (days <= 30) {
        alerts.push({ id: c.id, name: c.name, type: 'vacation_expiring', detail: `vence em ${days}d`, priority: 'high' })
      } else if (days <= 90) {
        alerts.push({ id: c.id, name: c.name, type: 'vacation_expiring', detail: `vence em ${days}d`, priority: 'medium' })
      }
    }
    // Promotion alerts
    const lastPromo = c.last_promotion_date || c.admission_date
    const months = differenceInMonths(today, parseISO(lastPromo))
    if (months >= 18) {
      alerts.push({ id: c.id, name: c.name, type: 'no_promotion', detail: `${months}m sem promoção`, priority: months >= 24 ? 'critical' : 'high' })
    }
  }

  alerts.sort((a, b) => {
    const p = { critical: 0, high: 1, medium: 2 }
    return p[a.priority] - p[b.priority]
  })

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar user={user} alerts={alerts} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
