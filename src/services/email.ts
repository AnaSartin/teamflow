import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.EMAIL_FROM ?? 'noreply@suaempresa.com.br'
const COMPANY = process.env.NEXT_PUBLIC_COMPANY_NAME ?? 'TeamFlow'

// ─── HTML base template ───────────────────────────────────────────────────────

function baseTemplate(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f5f7;margin:0;padding:0}
  .wrap{max-width:560px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb}
  .header{background:#1e40af;padding:24px 32px}
  .header h1{color:#fff;margin:0;font-size:18px;font-weight:600}
  .header p{color:#bfdbfe;margin:4px 0 0;font-size:13px}
  .body{padding:28px 32px}
  .body p{color:#374151;font-size:14px;line-height:1.6;margin:0 0 12px}
  .alert-box{background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:16px;margin:16px 0}
  .alert-box.amber{background:#fffbeb;border-color:#fde68a}
  .alert-box.blue{background:#eff6ff;border-color:#bfdbfe}
  table{width:100%;border-collapse:collapse;margin:16px 0}
  th{background:#f9fafb;text-align:left;padding:8px 12px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb}
  td{padding:10px 12px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6}
  .footer{padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af}
</style></head>
<body>
<div class="wrap">
  <div class="header"><h1>${COMPANY} — TeamFlow</h1><p>${title}</p></div>
  <div class="body">${body}</div>
  <div class="footer">Este é um e-mail automático do sistema TeamFlow. Não responda a esta mensagem.</div>
</div>
</body></html>`
}

// ─── Specific templates ───────────────────────────────────────────────────────

export interface VacationAlertItem {
  name: string
  team: string
  expiry: string
  daysLeft: number
}

export async function sendVacationExpiryAlert(
  recipients: string[],
  items: VacationAlertItem[]
) {
  const rows = items.map(i => `
    <tr>
      <td>${i.name}</td>
      <td>${i.team}</td>
      <td style="color:${i.daysLeft < 0 ? '#dc2626' : '#d97706'};font-weight:500">${i.expiry}</td>
      <td>${i.daysLeft < 0 ? `<span style="color:#dc2626">${Math.abs(i.daysLeft)}d vencidas</span>` : `${i.daysLeft}d restantes`}</td>
    </tr>`).join('')

  const body = `
    <p>Os colaboradores abaixo possuem férias com vencimento próximo ou já vencidas:</p>
    <table>
      <thead><tr><th>Colaborador</th><th>Equipe</th><th>Vencimento</th><th>Situação</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p>Acesse o sistema para agendar ou regularizar as férias.</p>`

  return resend.emails.send({
    from: FROM,
    to: recipients,
    subject: `⚠ Alerta de Férias — ${items.length} colaborador(es) com atenção necessária`,
    html: baseTemplate('Alerta de Férias', body),
  })
}

export interface PromoAlertItem {
  name: string
  team: string
  title: string
  monthsSincePromo: number
}

export async function sendNoPromotionAlert(
  recipients: string[],
  items: PromoAlertItem[]
) {
  const rows = items.map(i => `
    <tr>
      <td>${i.name}</td>
      <td>${i.team}</td>
      <td>${i.title}</td>
      <td style="color:#d97706;font-weight:500">${i.monthsSincePromo}m sem promoção</td>
    </tr>`).join('')

  const body = `
    <p>Os colaboradores abaixo estão há muito tempo sem promoção ou reajuste e podem necessitar de revisão:</p>
    <table>
      <thead><tr><th>Colaborador</th><th>Equipe</th><th>Cargo</th><th>Tempo</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`

  return resend.emails.send({
    from: FROM,
    to: recipients,
    subject: `📊 Revisão Salarial Pendente — ${items.length} colaborador(es)`,
    html: baseTemplate('Revisão Salarial Pendente', body),
  })
}

export interface AnniversaryItem {
  name: string
  team: string
  admDate: string
  yearsCompleting: number
}

export async function sendAnniversaryAlert(
  recipients: string[],
  items: AnniversaryItem[]
) {
  const rows = items.map(i => `
    <tr>
      <td>${i.name}</td>
      <td>${i.team}</td>
      <td>${i.admDate}</td>
      <td style="color:#1d4ed8;font-weight:500">${i.yearsCompleting} ano(s)</td>
    </tr>`).join('')

  const body = `
    <p>Próximos aniversários de empresa nos próximos 30 dias:</p>
    <table>
      <thead><tr><th>Colaborador</th><th>Equipe</th><th>Admissão</th><th>Completando</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`

  return resend.emails.send({
    from: FROM,
    to: recipients,
    subject: `🎉 Aniversários de Empresa — ${items.length} colaborador(es) nos próximos 30 dias`,
    html: baseTemplate('Aniversários de Empresa', body),
  })
}
