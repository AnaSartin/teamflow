'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type NotificationLog = {
  id: string
  type: string
  sent_to: string
  subject: string
  status: string
  error: string | null
  created_at: string
}

export default function SettingsForm({
  settings,
  userId,
  logs,
}: {
  settings: Record<string, unknown> | null
  userId: string
  logs: NotificationLog[]
}) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [emailEnabled, setEmailEnabled] = useState(settings?.email_enabled ?? true)
  const [recipients, setRecipients] = useState<string>(
    Array.isArray(settings?.email_recipients) ? (settings.email_recipients as string[]).join(', ') : (process.env.NEXT_PUBLIC_COMPANY_NAME ?? '')
  )
  const [vacDays, setVacDays] = useState(settings?.notify_vacation_expiring_days ?? 90)
  const [promoMonths, setPromoMonths] = useState(settings?.notify_no_promotion_months ?? 18)
  const [annivDays, setAnnivDays] = useState(settings?.notify_anniversary_days ?? 30)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaved(false)
    const recipientList = recipients.split(',').map(r => r.trim()).filter(Boolean)

    startTransition(async () => {
      const supabase = createClient()
      const payload = {
        user_id: userId,
        email_enabled: emailEnabled,
        email_recipients: recipientList,
        notify_vacation_expiring_days: Number(vacDays),
        notify_no_promotion_months: Number(promoMonths),
        notify_anniversary_days: Number(annivDays),
        updated_at: new Date().toISOString(),
      }

      const { error: err } = settings
        ? await supabase.from('notification_settings').update(payload).eq('user_id', userId)
        : await supabase.from('notification_settings').insert(payload)

      if (err) setError(err.message)
      else setSaved(true)
    })
  }

  const inputCls = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'

  return (
    <div className="space-y-5">
      {/* Notification settings */}
      <form onSubmit={handleSave}>
        <section className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Notificações por e-mail</h2>

          <div className="flex items-center gap-3 mb-5">
            <input
              type="checkbox"
              id="emailEnabled"
              checked={emailEnabled as boolean}
              onChange={e => setEmailEnabled(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300"
            />
            <label htmlFor="emailEnabled" className="text-sm text-slate-700 font-medium">Ativar envio de e-mails automáticos</label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Destinatários (separados por vírgula) *
              </label>
              <input
                type="text"
                value={recipients as string}
                onChange={e => setRecipients(e.target.value)}
                className={inputCls}
                placeholder="gestor@empresa.com.br, rh@empresa.com.br"
              />
              <p className="text-xs text-slate-400 mt-1">Receberão todos os alertas automáticos.</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Alertar férias com X dias antes
                </label>
                <input type="number" value={vacDays as number} onChange={e => setVacDays(parseInt(e.target.value))} className={inputCls} min={1} max={365} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Alertar sem promoção há X meses
                </label>
                <input type="number" value={promoMonths as number} onChange={e => setPromoMonths(parseInt(e.target.value))} className={inputCls} min={1} max={60} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Alertar aniversário X dias antes
                </label>
                <input type="number" value={annivDays as number} onChange={e => setAnnivDays(parseInt(e.target.value))} className={inputCls} min={1} max={60} />
              </div>
            </div>
          </div>
        </section>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        {saved && <p className="text-sm text-emerald-600 mb-3">Configurações salvas com sucesso!</p>}

        <div className="flex justify-end">
          <button type="submit" disabled={isPending} className="bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
            {isPending ? 'Salvando...' : 'Salvar configurações'}
          </button>
        </div>
      </form>

      {/* Cron info */}
      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Notificações automáticas (Cron)</h2>
        <p className="text-sm text-slate-600 mb-3">
          Configure um cron job no Vercel ou outro serviço para chamar a rota abaixo diariamente:
        </p>
        <div className="bg-slate-900 rounded-lg px-4 py-3 mb-3">
          <code className="text-sm text-emerald-400 font-mono">GET /api/cron/notifications</code>
          <br />
          <code className="text-xs text-slate-400 font-mono">Authorization: Bearer {'{CRON_SECRET}'}</code>
        </div>
        <p className="text-xs text-slate-400">
          No Vercel, adicione em <strong>vercel.json</strong> com a chave <code>crons</code> (plano Pro) ou use um serviço externo como cron-job.org (gratuito).
        </p>
      </section>

      {/* Notification logs */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Log de notificações</h2>
        </div>
        {logs.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Nenhuma notificação enviada ainda.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Tipo</th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5 hidden md:table-cell">Enviado para</th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Status</th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map(log => (
                <tr key={log.id} className="text-sm">
                  <td className="px-4 py-2.5 text-slate-700">{log.type}</td>
                  <td className="px-4 py-2.5 text-slate-500 hidden md:table-cell truncate max-w-[200px]">{log.sent_to}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${log.status === 'sent' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {log.status === 'sent' ? 'Enviado' : 'Erro'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-400 text-xs">
                    {format(parseISO(log.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
