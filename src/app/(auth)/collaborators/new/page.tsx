import { SectionHeader } from '@/components/ui'
import CollaboratorForm from '@/components/collaborators/CollaboratorForm'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function NewCollaboratorPage() {
  const supabase = await createClient()
  const { data: teams } = await supabase.from('teams').select('*').order('name')

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-5">
        <Link href="/collaborators" className="text-sm text-slate-500 hover:text-slate-800">← Voltar</Link>
      </div>
      <SectionHeader title="Novo colaborador" description="Preencha os dados para cadastrar um novo membro da equipe." />
      <CollaboratorForm teams={teams ?? []} />
    </div>
  )
}
