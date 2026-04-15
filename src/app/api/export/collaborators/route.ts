import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { differenceInMonths, parseISO, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const MACRO_LABELS: Record<string, string> = {
  junior: 'Júnior', pleno: 'Pleno', senior: 'Sênior',
}
const STATUS_LABELS: Record<string, string> = {
  active: 'Ativo', vacation: 'Férias', leave: 'Afastado', terminated: 'Desligado',
}

function fmtBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function fmtDateBR(d: string | null | undefined) {
  if (!d) return ''
  return format(parseISO(d), 'dd/MM/yyyy', { locale: ptBR })
}

/** Escape a value for CSV: wrap in quotes, escape internal quotes */
function csv(val: string | number | null | undefined): string {
  const s = String(val ?? '')
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const sp = request.nextUrl.searchParams
  const today = new Date()

  // ── Build query (mirrors collaborators page logic) ─────────────────────
  let query = supabase.from('collaborators').select('*').order('name')

  const status = sp.get('status')
  const macro  = sp.get('macro')
  const level  = sp.get('level')
  const team   = sp.get('team')
  const salary = sp.get('salary')
  const q      = sp.get('q')

  if (status) query = query.eq('status', status)
  if (macro)  query = query.eq('macro_role', macro)
  if (level)  query = query.eq('grid_level', parseInt(level))
  if (team)   query = query.eq('team', team)

  if (salary) {
    const [minStr, maxStr] = salary.split('-')
    const min = parseInt(minStr)
    if (!isNaN(min)) query = query.gte('current_salary', min)
    if (maxStr && maxStr !== '') {
      const max = parseInt(maxStr)
      if (!isNaN(max)) query = query.lte('current_salary', max)
    }
  }

  if (q && q.trim()) {
    const term = `%${q.trim()}%`
    query = query.or(
      `name.ilike.${term},email.ilike.${term},team.ilike.${term},manager.ilike.${term}`
    )
  }

  let { data: rows } = await query
  if (!rows) rows = []

  // Post-filter promo months
  const promoParam = sp.get('promo')
  if (promoParam) {
    const minMonths = parseInt(promoParam)
    rows = rows.filter(c => {
      const base = c.last_promotion_date || c.admission_date
      return differenceInMonths(today, parseISO(base)) >= minMonths
    })
  }

  // ── Build CSV ──────────────────────────────────────────────────────────
  const headers = [
    'Nome',
    'E-mail',
    'Cargo',
    'Nível',
    'Cargo Completo',
    'Equipe',
    'Gestor',
    'Status',
    'Admissão',
    'Tempo de Empresa',
    'Salário Atual',
    'Data Último Reajuste',
    'Meses s/ Reajuste',
    'Data Última Promoção',
    'Meses s/ Promoção',
    'Próximo Nível Previsto',
    'Previsão Promoção',
    'Observações',
  ]

  const lines: string[] = [headers.map(csv).join(',')]

  for (const c of rows) {
    const lastPromo = c.last_promotion_date || c.admission_date
    const lastRaise = c.last_raise_date || c.admission_date
    const monthsPromo = differenceInMonths(today, parseISO(lastPromo))
    const monthsRaise = differenceInMonths(today, parseISO(lastRaise))

    // Tenure
    const totalMonths = differenceInMonths(today, parseISO(c.admission_date))
    const years = Math.floor(totalMonths / 12)
    const months = totalMonths % 12
    const tenure = years > 0 ? `${years}a ${months}m` : `${months}m`

    const row = [
      c.name,
      c.email,
      MACRO_LABELS[c.macro_role] ?? c.macro_role,
      c.grid_level,
      c.full_title,
      c.team,
      c.manager ?? '',
      STATUS_LABELS[c.status] ?? c.status,
      fmtDateBR(c.admission_date),
      tenure,
      fmtBRL(c.current_salary),
      fmtDateBR(c.last_raise_date),
      monthsRaise,
      fmtDateBR(c.last_promotion_date),
      monthsPromo,
      c.next_level_forecast ?? '',
      fmtDateBR(c.promotion_forecast_date),
      c.notes ?? '',
    ]
    lines.push(row.map(v => csv(v)).join(','))
  }

  // UTF-8 BOM so Excel auto-detects encoding
  const BOM = '\uFEFF'
  const csvContent = BOM + lines.join('\r\n')

  const now = format(today, 'yyyy-MM-dd', { locale: ptBR })
  const filename = `teamflow-colaboradores-${now}.csv`

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
