import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SectionHeader } from '@/components/ui'
import CollaboratorForm from '@/components/collaborators/CollaboratorForm'

export default async function EditCollaboratorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: collaborator }, { data: teams }] = await Promise.all([
    supabase.from('collaborators').select('*').eq('id', id).single(),
    supabase.from('teams').select('*').order('name'),
  ])

  if (!collaborator) notFound()

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-5">
        <Link href={`/collaborators/${id}`} className="text-sm text-slate-500 hover:text-slate-800">← Voltar</Link>
      </div>
      <SectionHeader title="Editar colaborador" description={collaborator.name} />
      <CollaboratorForm collaborator={collaborator} teams={teams ?? []} />
    </div>
  )
}
