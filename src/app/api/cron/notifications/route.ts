import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  sendVacationExpiryAlert,
  sendNoPromotionAlert,
  sendAnniversaryAlert,
} from '@/services/email'
import {
  differenceInDays,
  differenceInMonths,
  parseISO,
  format,
  addYears,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function GET(request: NextRequest) {
  // Validate cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()
  const today = new Date()

  // Fetch notification settings (use defaults if none)
  const { data: settings } = await supabase
    .from('notification_settings')
    .select('*')
    .limit(1)
    .single()

  const vacationDaysThreshold = settings?.notify_vacation_expiring_days ?? 90
  const noPromoMonths = settings?.notify_no_promotion_months ?? 18
  const anniversaryDays = settings?.notify_anniversary_days ?? 30
  const recipients: string[] = settings?.email_recipients?.length
    ? settings.email_recipients
    : [process.env.EMAIL_MANAGER!]

  if (!recipients.length || !recipients[0]) {
    return NextResponse.json({ error: 'No recipients configured' }, { status: 400 })
  }

  const supabaseAdmin = await createServiceClient()

  // ── Fetch collaborators ──────────────────────────────────────────────────
  const { data: collaborators } = await supabaseAdmin
    .from('collaborators')
    .select('*, vacations(*)')
    .neq('status', 'terminated')

  if (!collaborators?.length) {
    return NextResponse.json({ message: 'No collaborators' })
  }

  const logs: Record<string, unknown>[] = []

  // ── 1. Vacation expiry alerts ────────────────────────────────────────────
  const vacationItems = collaborators
    .flatMap((c: Record<string, unknown>) => {
      const vacations = (c.vacations as Record<string, unknown>[]) || []
      return vacations
        .filter((v: Record<string, unknown>) => v.status !== 'completed')
        .map((v: Record<string, unknown>) => {
          const days = differenceInDays(parseISO(v.expiry_date as string), today)
          return { collab: c, vacation: v, daysLeft: days }
        })
        .filter(({ daysLeft }) => daysLeft <= vacationDaysThreshold)
    })
    .map(({ collab, vacation, daysLeft }) => ({
      name: collab.name as string,
      team: collab.team as string,
      expiry: format(parseISO(vacation.expiry_date as string), 'dd/MM/yyyy', { locale: ptBR }),
      daysLeft,
    }))

  if (vacationItems.length > 0) {
    try {
      const result = await sendVacationExpiryAlert(recipients, vacationItems)
      logs.push({ type: 'vacation_expiry', status: 'sent', count: vacationItems.length, id: (result as { id?: string }).id })
    } catch (e) {
      logs.push({ type: 'vacation_expiry', status: 'failed', error: String(e) })
    }
  }

  // ── 2. No promotion alerts ────────────────────────────────────────────────
  const promoItems = collaborators
    .map((c: Record<string, unknown>) => {
      const base = c.last_promotion_date || c.admission_date
      const months = differenceInMonths(today, parseISO(base as string))
      return { c, months }
    })
    .filter(({ months }) => months >= noPromoMonths)
    .map(({ c, months }) => ({
      name: c.name as string,
      team: c.team as string,
      title: c.full_title as string,
      monthsSincePromo: months,
    }))

  if (promoItems.length > 0) {
    try {
      const result = await sendNoPromotionAlert(recipients, promoItems)
      logs.push({ type: 'no_promotion', status: 'sent', count: promoItems.length, id: (result as { id?: string }).id })
    } catch (e) {
      logs.push({ type: 'no_promotion', status: 'failed', error: String(e) })
    }
  }

  // ── 3. Work anniversaries ─────────────────────────────────────────────────
  const anniversaryItems = collaborators
    .map((c: Record<string, unknown>) => {
      const adm = parseISO(c.admission_date as string)
      const yearsCompleting = Math.floor(differenceInMonths(today, adm) / 12) + 1
      const nextAnniversary = addYears(adm, yearsCompleting)
      const daysUntil = differenceInDays(nextAnniversary, today)
      return { c, yearsCompleting, daysUntil }
    })
    .filter(({ daysUntil }) => daysUntil >= 0 && daysUntil <= anniversaryDays)
    .map(({ c, yearsCompleting }) => ({
      name: c.name as string,
      team: c.team as string,
      admDate: format(parseISO(c.admission_date as string), 'dd/MM/yyyy', { locale: ptBR }),
      yearsCompleting,
    }))

  if (anniversaryItems.length > 0) {
    try {
      const result = await sendAnniversaryAlert(recipients, anniversaryItems)
      logs.push({ type: 'anniversary', status: 'sent', count: anniversaryItems.length, id: (result as { id?: string }).id })
    } catch (e) {
      logs.push({ type: 'anniversary', status: 'failed', error: String(e) })
    }
  }

  // ── Persist logs ──────────────────────────────────────────────────────────
  if (logs.length > 0) {
    await supabaseAdmin.from('notification_logs').insert(
      logs.map(l => ({
        type: l.type,
        sent_to: recipients.join(','),
        subject: `cron-${l.type}`,
        status: l.status,
        error: l.error || null,
      }))
    )
  }

  return NextResponse.json({ ok: true, logs })
}
