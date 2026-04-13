import { createClient } from '@/lib/supabase/server'
import { SectionHeader } from '@/components/ui'
import SettingsForm from '@/components/settings/SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: settings } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  const { data: logs } = await supabase
    .from('notification_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <SectionHeader title="Configurações" description="Notificações por e-mail e preferências do sistema." />
      <SettingsForm settings={settings} userId={user!.id} logs={logs ?? []} />
    </div>
  )
}
