# TeamFlow — Documentação Técnica

> Para desenvolvedores e responsáveis pelo ambiente de produção.

---

## Sumário

1. [Visão geral da arquitetura](#1-visão-geral-da-arquitetura)
2. [Stack completa e versões](#2-stack-completa-e-versões)
3. [Estrutura de pastas](#3-estrutura-de-pastas)
4. [Modelo de banco de dados](#4-modelo-de-banco-de-dados)
5. [Segurança — RLS, auditoria e middleware](#5-segurança--rls-auditoria-e-middleware)
6. [Server Actions — padrão de retorno](#6-server-actions--padrão-de-retorno)
7. [Como rodar localmente](#7-como-rodar-localmente)
8. [Variáveis de ambiente](#8-variáveis-de-ambiente)
9. [Deploy na Vercel](#9-deploy-na-vercel)
10. [Migrations](#10-migrations)
11. [Cron job de notificações](#11-cron-job-de-notificações)
12. [Como manter o sistema](#12-como-manter-o-sistema)

---

## 1. Visão geral da arquitetura

```
┌─────────────┐     HTTPS      ┌──────────────┐     PostgreSQL    ┌──────────────┐
│   Navegador  │ ◄────────────► │  Next.js 15   │ ◄──────────────► │   Supabase   │
│  (usuário)  │                │  (Vercel)     │                  │ (DB+Auth+RLS)│
└─────────────┘                └──────────────┘                  └──────────────┘
                                       │
                                       │ HTTP (Resend API)
                                       ▼
                                ┌──────────────┐
                                │    Resend     │
                                │   (e-mails)  │
                                └──────────────┘
```

**Single-tenant:** o sistema gerencia uma única empresa (Adaptive). Não há multi-tenancy — todas as tabelas pertencem a um único workspace.

**Fluxo de autenticação:**

1. Usuário faz login com e-mail e senha via Supabase Auth
2. O Supabase emite um JWT que é armazenado em cookie HttpOnly
3. O middleware Next.js (`src/middleware.ts`) valida o JWT a cada requisição via `@supabase/ssr`
4. Rotas sem autenticação válida redirecionam automaticamente para `/login`
5. Após o login, usuário é redirecionado para `/dashboard`

**Fluxo de dados:**

- Páginas são server-rendered (React Server Components) e fazem queries diretas ao Supabase via `@supabase/ssr`
- Mutações de dados usam Next.js Server Actions (`'use server'`) — nenhuma API REST exposta para CRUD
- Após cada mutação, `revalidatePath()` invalida o cache do segmento relevante
- Componentes interativos (modais, filtros, dropdowns) são Client Components (`'use client'`) que chamam Server Actions via `useTransition`

---

## 2. Stack completa e versões

| Tecnologia | Versão | Função |
|---|---|---|
| **Next.js** | 15.2.9 | Framework fullstack (App Router) |
| **React** | 18.3.1 | Interface do usuário |
| **TypeScript** | 5.6.3 | Tipagem estática end-to-end |
| **Tailwind CSS** | 3.4.15 | Estilização utility-first |
| **Supabase JS** | 2.45.4 | Cliente PostgreSQL + Auth |
| **@supabase/ssr** | 0.5.1 | Integração SSR e middleware |
| **date-fns** | 4.1.0 | Manipulação de datas com locale pt-BR |
| **Resend** | 4.0.0 | Envio de e-mails transacionais |
| **Zod** | 3.23.8 | Validação de schemas |
| **React Hook Form** | 7.53.2 | Gerenciamento de formulários |
| **Radix UI** | vários | Componentes de UI acessíveis (Dialog, Select, Tabs etc.) |
| **Lucide React** | 0.454.0 | Ícones SVG |
| **react-day-picker** | 9.3.2 | Seletor de datas |
| **xlsx** | 0.18.5 | Geração de arquivos Excel/CSV |
| **Vercel** | — | Hospedagem, deploy contínuo e cron jobs |

**Banco de dados:** PostgreSQL hospedado no Supabase (managed), com Row Level Security (RLS) e Supabase Auth para gerenciamento de sessões.

---

## 3. Estrutura de pastas

```
teamflow/
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── (auth)/                       # Grupo de rotas protegidas (requerem login)
│   │   │   ├── layout.tsx                # Layout com Sidebar, Topbar e cálculo de alertas
│   │   │   ├── dashboard/page.tsx        # Dashboard executivo (KPIs, alertas, gráficos)
│   │   │   ├── collaborators/            # CRUD de colaboradores
│   │   │   │   ├── page.tsx              # Listagem com filtros e busca
│   │   │   │   ├── new/page.tsx          # Formulário de cadastro
│   │   │   │   └── [id]/page.tsx         # Ficha individual do colaborador
│   │   │   ├── grid/page.tsx             # Grelha salarial com edição inline
│   │   │   ├── vacations/page.tsx        # Agenda de férias
│   │   │   └── settings/page.tsx         # Configurações de notificações
│   │   ├── actions/                      # Next.js Server Actions ('use server')
│   │   │   ├── collaborators.ts          # createCollaborator, updateCollaborator,
│   │   │   │                             #   deleteCollaborator, updateStatus,
│   │   │   │                             #   registerPromotion, registerRaise,
│   │   │   │                             #   importCollaboratorsCSV
│   │   │   ├── grid.ts                   # updateGridPosition
│   │   │   └── vacations.ts              # scheduleVacation, completeVacation,
│   │   │                                 #   createVacationPeriod
│   │   ├── api/
│   │   │   ├── cron/notifications/       # GET — endpoint do cron job de e-mails
│   │   │   │   └── route.ts
│   │   │   └── export/collaborators/     # GET — exportação CSV/Excel
│   │   │       └── route.ts
│   │   ├── login/page.tsx                # Formulário de autenticação
│   │   ├── layout.tsx                    # Root layout (html, body, fontes)
│   │   └── globals.css                   # Estilos globais Tailwind
│   ├── components/
│   │   ├── collaborators/                # CollaboratorForm, CollaboratorsFilters,
│   │   │   │                             #   PromotionModal, RaiseModal,
│   │   │   │                             #   QuickStatusSelect, DeleteCollaboratorButton,
│   │   │   │                             #   CSVImport
│   │   ├── grid/                         # GridEditModal
│   │   ├── vacations/                    # VacationModal, NewVacationPeriodModal
│   │   ├── layout/                       # Sidebar, Topbar, AlertsPanel
│   │   └── ui/                           # Badge, Avatar, StatCard, AlertBanner,
│   │                                     #   SectionHeader, etc.
│   ├── lib/
│   │   ├── cn.ts                         # Utilitário clsx + tailwind-merge
│   │   ├── utils.ts                      # fmtDate, fmtCurrency, buildTitle,
│   │   │                                 #   MACRO_LABELS e outros helpers
│   │   └── supabase/
│   │       ├── server.ts                 # createClient() e createServiceClient()
│   │       │                             #   para Server Components e Server Actions
│   │       └── client.ts                 # createBrowserClient() para Client Components
│   ├── services/
│   │   └── email.ts                      # sendVacationExpiryAlert,
│   │                                     #   sendNoPromotionAlert, sendAnniversaryAlert
│   ├── types/
│   │   └── index.ts                      # Todos os tipos TypeScript globais
│   └── middleware.ts                     # Proteção de rotas via JWT Supabase
├── supabase/
│   └── migrations/
│       └── 001_security_hardening.sql    # Migration de endurecimento de segurança
├── docs/
│   ├── manual-do-usuario.md
│   ├── documentacao-tecnica.md
│   └── apresentacao-comercial.md
├── vercel.json                           # Configuração do cron job Vercel
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Modelo de banco de dados

### 4.1 Tabelas

| Tabela | Descrição |
|---|---|
| `collaborators` | Dados completos de cada colaborador: nome, e-mail, cargo, nível, equipe, gestor, salário, datas de admissão / último reajuste / última promoção, previsões de carreira, status e observações |
| `salary_grid` | 12 posições da grelha salarial (3 macro_roles × 4 níveis): faixa mínima, faixa máxima, cargo completo e observações |
| `vacations` | Períodos aquisitivos e agendamentos de férias: datas de aquisição, vencimento, início e fim agendados, status do período |
| `promotion_history` | Histórico de promoções: cargo/nível anterior e novo, salário antes e depois, data, quem executou (`performed_by_email`) |
| `salary_history` | Histórico de reajustes: salário antes e depois, data, motivo, quem executou (`performed_by_email`) |
| `audit_log` | Log geral de auditoria: entidade afetada, ação realizada, usuário responsável, timestamp e payload JSONB com detalhes |
| `notification_settings` | Preferências de notificação: thresholds de férias, promoção, aniversários e lista de destinatários |
| `notification_logs` | Log de e-mails disparados pelo cron: tipo, destinatário, assunto, status (sent/failed) e erro |

### 4.2 Enums do banco

```sql
-- Cargo macro
macro_role: 'junior' | 'pleno' | 'senior'

-- Nível dentro do cargo (1 a 4)
grid_level: 1 | 2 | 3 | 4

-- Status do colaborador
collab_status: 'active' | 'vacation' | 'leave' | 'terminated'

-- Status do período de férias
vacation_status: 'not_scheduled' | 'scheduled' | 'ongoing' | 'completed' | 'expired'
```

### 4.3 Tipos TypeScript (src/types/index.ts)

Os tipos espelham fielmente o schema do banco. Principais interfaces:

- `Collaborator` — linha da tabela `collaborators`
- `GridPosition` — linha da tabela `salary_grid`
- `Vacation` — linha da tabela `vacations` (com join opcional de `Collaborator`)
- `PromotionHistory` — linha da tabela `promotion_history`
- `SalaryHistory` — linha da tabela `salary_history`
- `DashboardStats` — objeto computado para os KPIs do Dashboard
- `CollaboratorWithMeta` — `Collaborator` + campos calculados (`tenure_text`, `months_since_promotion`, `vacation_expiry_days` etc.)

---

## 5. Segurança — RLS, auditoria e middleware

### 5.1 Row Level Security (RLS)

Todas as tabelas têm RLS habilitado. As políticas seguem o padrão:

- **Leitura e escrita:** permitidas apenas para usuários autenticados (`TO authenticated`)
- **`audit_log`:** authenticated pode SELECT e INSERT; UPDATE e DELETE não têm política (bloqueados para todos os usuários comuns)
- **`notification_logs`:** INSERT só pelo `service_role` (usado pelo cron job); usuários comuns não podem inserir logs falsos

```sql
-- Exemplo de política em colaboradores
CREATE POLICY "auth_select_collaborators" ON collaborators
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "auth_write_collaborators" ON collaborators
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

### 5.2 FORCE ROW LEVEL SECURITY

Tabelas críticas têm `FORCE ROW LEVEL SECURITY`, o que garante que mesmo o dono do schema (role `postgres`) respeite as políticas quando conectado como usuário da aplicação:

```sql
ALTER TABLE salary_grid   FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_log     FORCE ROW LEVEL SECURITY;
ALTER TABLE collaborators FORCE ROW LEVEL SECURITY;
```

### 5.3 service_role vs anon key

| Chave | Onde é usada | Acesso |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser e middleware | Sujeito ao RLS — acesso de usuário anônimo ou autenticado |
| `SUPABASE_SERVICE_ROLE_KEY` | Apenas no cron job (server-side) | Bypassa RLS — acesso total ao banco |

A `SERVICE_ROLE_KEY` **nunca** é enviada ao browser. Ela é usada exclusivamente pelo `createServiceClient()` em `src/lib/supabase/server.ts`, chamado apenas dentro do endpoint `/api/cron/notifications`.

### 5.4 Audit trail

Toda ação relevante é registrada no `audit_log`. O helper `logAudit()` está presente em todos os Server Actions:

```typescript
// Campos registrados em cada evento:
{
  performed_by: string,   // e-mail do usuário autenticado
  entity: string,         // 'collaborator' | 'salary_grid' | 'vacation'
  entity_id: string,      // UUID da entidade afetada
  entity_name: string,    // Nome legível (ex.: "João Silva")
  action: string,         // 'create' | 'update' | 'delete' | 'status_change' |
                          //   'grid_update' | 'vacation_schedule' | 'promotion' | 'raise'
  details: JSONB,         // Payload relevante (campos antes/depois, valores)
  event_time: TIMESTAMPTZ // Automático pelo banco
}
```

A falha no audit log é **não-fatal** — um bloco `try/catch` garante que o erro de auditoria nunca bloqueie a operação principal.

### 5.5 Middleware de autenticação

`src/middleware.ts` intercepta todas as requisições (exceto assets estáticos e a rota pública `/api/cron/notifications`):

```typescript
// Rotas públicas que passam sem autenticação:
// /login, /api/cron/notifications

// Qualquer outra rota sem JWT válido → redirect para /login?redirectTo=<pathname>
// Login com JWT válido → redirect automático para /dashboard
```

### 5.6 Proteção do cron job

O endpoint `GET /api/cron/notifications` valida o header `Authorization: Bearer <CRON_SECRET>` antes de processar qualquer lógica:

```typescript
const authHeader = request.headers.get('authorization')
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

A Vercel injeta automaticamente esse header ao disparar o cron configurado em `vercel.json`.

---

## 6. Server Actions — padrão de retorno

**Importante para produção no Next.js 15:** Server Actions que fazem `throw new Error(mensagem)` em produção têm a mensagem substituída por um erro genérico ("An error occurred in the Server Components render"). Para preservar mensagens de erro legíveis pelo usuário, todas as actions de mutação seguem o padrão de **retornar `{ error?: string }`** em vez de lançar exceções:

```typescript
// Padrão adotado em TODAS as Server Actions do projeto:
export async function scheduleVacation(payload: { ... }): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Sessão expirada. Faça login novamente.' }

    // validações de negócio
    if (payload.scheduled_end <= payload.scheduled_start)
      return { error: 'A data de retorno deve ser posterior ao início das férias.' }

    // operação no banco
    const { error: dbError } = await supabase.from('vacations').insert({ ... })
    if (dbError) return { error: `Erro ao agendar férias: ${dbError.message}` }

    // audit log (não-fatal)
    await logAudit(...)

    revalidatePath('/vacations')
    return {}                // sucesso: objeto vazio
  } catch (e) {
    console.error('[scheduleVacation] unexpected error:', e)
    return { error: 'Ocorreu um erro inesperado. Tente novamente.' }
  }
}
```

**No lado do cliente (componentes):**

```typescript
// Client Component usando useTransition:
startTransition(async () => {
  const result = await scheduleVacation(payload)
  if (result?.error) {
    setError(result.error)  // exibe para o usuário
  } else {
    setOpen(false)          // fecha modal, página revalida automaticamente
  }
})
```

**Exceção:** `createCollaborator` usa `redirect()` após o sucesso (para navegar para a ficha do novo colaborador), que internamente lança uma exceção especial do Next.js — comportamento esperado e correto.

---

## 7. Como rodar localmente

### 7.1 Pré-requisitos

- Node.js 18.17+ (recomendado: 20 LTS)
- npm 9+ ou pnpm 8+
- Conta no [Supabase](https://supabase.com) (free tier funciona)
- Conta na [Vercel](https://vercel.com) (necessário apenas para deploy)
- Conta no [Resend](https://resend.com) para e-mails (free tier: 100 e-mails/dia)

### 7.2 Clonar e instalar

```bash
git clone <url-do-repositorio>
cd teamflow
npm install
```

### 7.3 Configurar variáveis de ambiente

```bash
cp .env.example .env.local
# Edite .env.local com seus valores (veja Seção 8)
```

### 7.4 Criar o banco de dados no Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Acesse **SQL Editor** no painel do Supabase
3. Cole e execute o conteúdo do arquivo `supabase/schema.sql`
4. Execute também o arquivo `supabase/migrations/001_security_hardening.sql`

### 7.5 Criar o primeiro usuário

1. No painel do Supabase, acesse **Authentication → Users**
2. Clique em **Invite user** ou **Add user**
3. Informe o e-mail e senha do gestor

### 7.6 Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:3000`

O login redireciona automaticamente para o Dashboard.

---

## 8. Variáveis de ambiente

Crie o arquivo `.env.local` na raiz do projeto. Nunca suba este arquivo para o repositório (já está no `.gitignore`).

```env
# ── Supabase ──────────────────────────────────────────────────────────────────
# Encontre em: Project Settings → API

NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Necessário apenas para o cron job — nunca expor ao browser
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# ── E-mail (Resend) ───────────────────────────────────────────────────────────
# Cadastre em resend.com e valide seu domínio de envio

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=teamflow@suaempresa.com.br
EMAIL_MANAGER=gestor@suaempresa.com.br

# ── App ───────────────────────────────────────────────────────────────────────

NEXT_PUBLIC_APP_URL=https://teamflow-pearl-seven.vercel.app

# ── Cron ─────────────────────────────────────────────────────────────────────
# Gere uma string aleatória segura: openssl rand -hex 32

CRON_SECRET=sua_chave_secreta_aqui
```

### Descrição de cada variável

| Variável | Exposição | Descrição |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Pública (browser) | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública (browser) | Chave anon — acesso sujeito ao RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Privada (servidor) | Chave de serviço — bypassa RLS; usar só no cron |
| `RESEND_API_KEY` | Privada (servidor) | Chave da API Resend para envio de e-mails |
| `EMAIL_FROM` | Privada (servidor) | Endereço de remetente dos e-mails automáticos |
| `EMAIL_MANAGER` | Privada (servidor) | Destinatário padrão dos alertas |
| `NEXT_PUBLIC_APP_URL` | Pública (browser) | URL base da aplicação (usada em links nos e-mails) |
| `CRON_SECRET` | Privada (servidor) | Token de autorização do endpoint do cron job |

> `NEXT_PUBLIC_*` são incorporadas no bundle do browser pelo Next.js — nunca coloque secrets com esse prefixo.

---

## 9. Deploy na Vercel

### 9.1 Primeiro deploy

1. Acesse [vercel.com](https://vercel.com) e importe o repositório
2. Na tela de configuração do projeto:
   - Framework: **Next.js** (detectado automaticamente)
   - Build Command: `npm run build`
   - Output Directory: `.next`
3. Adicione todas as variáveis de ambiente da Seção 8 em **Settings → Environment Variables**
4. Clique em **Deploy**

### 9.2 Configurar variáveis de ambiente na Vercel

1. Acesse o projeto na Vercel
2. Vá em **Settings → Environment Variables**
3. Adicione cada variável listada na Seção 8
4. Marque os ambientes: **Production**, **Preview**, **Development** conforme necessário
5. Clique em **Save**

> Após adicionar ou alterar variáveis, é necessário fazer um **novo deploy** (Redeploy) para que entrem em vigor.

### 9.3 Domínio personalizado

1. No painel da Vercel, vá em **Settings → Domains**
2. Adicione o domínio (ex.: `teamflow.suaempresa.com.br`)
3. Configure os registros DNS conforme as instruções da Vercel (registro A ou CNAME)
4. Atualize `NEXT_PUBLIC_APP_URL` para o novo domínio e faça redeploy

### 9.4 Deploy contínuo

Cada `git push` para a branch `main` dispara automaticamente um novo deploy na Vercel. Pull requests geram previews em URLs temporárias.

---

## 10. Migrations

As migrations ficam na pasta `supabase/migrations/`. Elas **não são aplicadas automaticamente** — precisam ser executadas manualmente no SQL Editor do Supabase.

### 10.1 Como executar uma migration

1. Acesse o painel do Supabase
2. Vá em **SQL Editor**
3. Abra o arquivo de migration desejado
4. Cole o conteúdo no editor
5. Clique em **Run**

### 10.2 Migrations disponíveis

| Arquivo | Conteúdo |
|---|---|
| `001_security_hardening.sql` | Adiciona `performed_by_email` em `promotion_history` e `salary_history`; cria a tabela `audit_log` com índices e políticas RLS; aplica `FORCE ROW LEVEL SECURITY` em `salary_grid`; restringe INSERT em `notification_logs` ao `service_role` |

### 10.3 Criar novas migrations

Por convenção, nomeie os arquivos com prefixo numérico sequencial:

```
supabase/migrations/002_nome_descritivo.sql
supabase/migrations/003_outro_ajuste.sql
```

Sempre teste no ambiente de desenvolvimento antes de aplicar em produção.

---

## 11. Cron job de notificações

O sistema envia e-mails automáticos pelo endpoint `GET /api/cron/notifications`.

### 11.1 O que o cron envia

| Tipo | Condição | Configurável em |
|---|---|---|
| Alerta de férias vencendo | Faltam N dias para o vencimento | Configurações → Férias a vencer |
| Alerta sem promoção | Colaborador sem promoção há mais de N meses | Configurações → Sem promoção |
| Aniversário de empresa | Colaborador completa anos de empresa em N dias | Configurações → Aniversários |

Os thresholds padrão são: 90 dias (férias), 18 meses (promoção), 30 dias (aniversário). Valores customizados são lidos da tabela `notification_settings`.

### 11.2 Schedule configurado

O arquivo `vercel.json` na raiz define o schedule:

```json
{
  "crons": [
    {
      "path": "/api/cron/notifications",
      "schedule": "0 8 * * 1-5"
    }
  ]
}
```

Este exemplo executa toda **segunda a sexta-feira às 8h UTC (5h de Brasília)**. A Vercel injeta automaticamente o header `Authorization: Bearer <CRON_SECRET>`.

Use [crontab.guru](https://crontab.guru) para montar e testar expressões cron.

### 11.3 Implementação do endpoint

O endpoint (`src/app/api/cron/notifications/route.ts`):

1. Valida o `CRON_SECRET` no header — retorna 401 se inválido
2. Cria um client Supabase com `service_role` (bypassa RLS)
3. Lê as configurações de notificação da tabela `notification_settings`
4. Busca todos os colaboradores não desligados com seus períodos de férias
5. Para cada tipo de alerta, avalia a condição e chama o helper de e-mail correspondente (`src/services/email.ts`)
6. Registra cada envio (sucesso ou falha) na tabela `notification_logs`
7. Retorna um resumo JSON com os logs de cada tipo de envio

### 11.4 Testar manualmente

```bash
curl -X GET \
  "https://teamflow-pearl-seven.vercel.app/api/cron/notifications" \
  -H "Authorization: Bearer <CRON_SECRET>"
```

Resposta esperada em caso de sucesso:

```json
{
  "ok": true,
  "sent": 3,
  "logs": [
    { "type": "vacation_expiry", "collaborator": "João Silva", "status": "sent" },
    { "type": "no_promotion",    "collaborator": "Maria Souza", "status": "sent" }
  ]
}
```

---

## 12. Como manter o sistema

### Adicionar um novo usuário ao sistema

1. No painel do Supabase → **Authentication → Users**
2. Clique em **Invite user**
3. Informe o e-mail — o usuário receberá um link para definir a senha

### Redefinir a senha de um usuário

1. No painel do Supabase → **Authentication → Users**
2. Localize o usuário
3. Clique nos três pontos → **Send password reset**

### Adicionar colaboradores

Use a tela de Colaboradores → **+ Novo** (um a um) ou **Importar CSV** (em massa). Veja o manual do usuário para o formato do CSV.

### Atualizar a grelha salarial

Use a tela de **Grelha Salarial → Editar** para cada posição. A alteração é auditada automaticamente em `audit_log`. Salários dos colaboradores não são alterados automaticamente — ajuste individualmente via "Reajuste salarial".

### Ver logs de erro da aplicação

1. No painel da Vercel → seu projeto → **Functions** ou **Logs**
2. Filtre por rota ou por período
3. Logs de erro do servidor aparecem em tempo real

### Fazer backup do banco

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Login
supabase login

# Dump completo do banco de dados
supabase db dump --project-ref <ref-do-projeto> > backup-$(date +%Y%m%d).sql
```

O Supabase mantém backups automáticos contínuos para planos pagos (Point-in-Time Recovery). No free tier, faça dumps manuais periodicamente e guarde em local seguro.

### Atualizar dependências

```bash
npm outdated              # ver o que está desatualizado
npm update                # atualizar patch versions
npm install pacote@latest # atualizar uma dependência específica
npm run build             # sempre verificar o build após atualizar
```

Antes de atualizar Next.js ou Supabase, leia o changelog — ambos fazem breaking changes em versões minor.

### Monitorar envio de e-mails

Na interface do Resend (resend.com/emails), é possível ver todos os e-mails enviados, taxas de entrega e bounces. No próprio TeamFlow, a tabela `notification_logs` registra todos os envios do cron com status (`sent` / `failed`) e mensagem de erro quando falha.

---

**URL de produção:** https://teamflow-pearl-seven.vercel.app

*Documentação técnica — TeamFlow v1.1 · Abril de 2026*
