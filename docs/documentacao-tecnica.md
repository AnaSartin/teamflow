# TeamFlow — Documentação Técnica

> Para desenvolvedores e responsáveis pelo ambiente de produção.

---

## Sumário

1. [Visão geral da arquitetura](#1-visão-geral-da-arquitetura)
2. [Tecnologias utilizadas](#2-tecnologias-utilizadas)
3. [Pré-requisitos](#3-pré-requisitos)
4. [Rodando o projeto localmente](#4-rodando-o-projeto-localmente)
5. [Variáveis de ambiente](#5-variáveis-de-ambiente)
6. [Estrutura de pastas](#6-estrutura-de-pastas)
7. [Banco de dados (Supabase)](#7-banco-de-dados-supabase)
8. [Deploy na Vercel](#8-deploy-na-vercel)
9. [Cron job de notificações](#9-cron-job-de-notificações)
10. [Segurança e LGPD](#10-segurança-e-lgpd)
11. [Manutenção comum](#11-manutenção-comum)

---

## 1. Visão geral da arquitetura

```
┌─────────────┐     HTTPS      ┌──────────────┐     PostgreSQL    ┌──────────┐
│   Navegador  │ ◄────────────► │  Next.js 15   │ ◄──────────────► │ Supabase │
│  (usuário)  │                │  (Vercel)     │                  │ (DB+Auth)│
└─────────────┘                └──────────────┘                  └──────────┘
                                       │
                                       │ HTTP (Resend API)
                                       ▼
                                ┌──────────────┐
                                │   Resend      │
                                │  (e-mails)   │
                                └──────────────┘
```

**Fluxo de autenticação:**
1. Usuário faz login com e-mail e senha via Supabase Auth
2. O middleware Next.js valida o JWT a cada requisição
3. Rotas sem autenticação válida redirecionam para `/login`

**Fluxo de dados:**
- Páginas server-rendered fazem queries diretas ao Supabase via `@supabase/ssr`
- Mutações de dados usam Next.js Server Actions (`'use server'`)
- Revalidação de cache feita via `revalidatePath()` após cada mutação

---

## 2. Tecnologias utilizadas

| Tecnologia | Versão | Função |
|-----------|--------|--------|
| **Next.js** | 15.2.9 | Framework fullstack (App Router) |
| **React** | 18.3.1 | Interface do usuário |
| **TypeScript** | 5.6.3 | Tipagem estática |
| **Supabase** | 2.45.4 | Banco de dados PostgreSQL + Autenticação |
| **@supabase/ssr** | 0.5.1 | Integração SSR/middleware |
| **Tailwind CSS** | 3.4.15 | Estilização |
| **date-fns** | 4.1.0 | Manipulação de datas (locale pt-BR) |
| **Resend** | 4.0.0 | Envio de e-mails transacionais |
| **Zod** | 3.23.8 | Validação de schemas |
| **Lucide React** | 0.454.0 | Ícones |
| **Vercel** | — | Hospedagem e deploy |

---

## 3. Pré-requisitos

- **Node.js** 18.17+ (recomendado: 20 LTS)
- **npm** 9+ ou **pnpm** 8+
- Conta no **Supabase** (free tier funciona)
- Conta na **Vercel** (free tier funciona)
- Conta no **Resend** para e-mails (free tier: 100 e-mails/dia)

---

## 4. Rodando o projeto localmente

### 4.1 Clonar e instalar

```bash
git clone <url-do-repositorio>
cd teamflow
npm install
```

### 4.2 Configurar variáveis de ambiente

```bash
cp .env.example .env.local
# Edite .env.local com seus valores (veja seção 5)
```

### 4.3 Criar o banco de dados no Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Acesse o SQL Editor no painel do Supabase
3. Cole e execute o conteúdo do arquivo `supabase/schema.sql`
4. Aguarde a criação das tabelas

### 4.4 Criar o primeiro usuário

1. No painel do Supabase, acesse **Authentication → Users**
2. Clique em **Invite user** ou **Add user**
3. Informe o e-mail e senha do gestor

### 4.5 Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:3000`

---

## 5. Variáveis de ambiente

Crie o arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# ── Supabase ──────────────────────────────────────────────────
# Encontre no painel: Project Settings → API

NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Necessário apenas para operações administrativas (cron job)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# ── E-mail (Resend) ───────────────────────────────────────────
# Cadastre em resend.com e valide seu domínio

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=teamflow@suaempresa.com.br
EMAIL_MANAGER=gestor@suaempresa.com.br

# ── App ───────────────────────────────────────────────────────

NEXT_PUBLIC_APP_URL=https://teamflow-pearl-seven.vercel.app
NEXT_PUBLIC_COMPANY_NAME=Sua Empresa

# ── Cron ─────────────────────────────────────────────────────
# Gere uma string aleatória e segura (ex.: openssl rand -hex 32)

CRON_SECRET=sua_chave_secreta_aqui
```

> ⚠️ **Nunca** suba o `.env.local` para o repositório. O arquivo já está no `.gitignore`.

### Variáveis públicas vs. privadas

- `NEXT_PUBLIC_*` → expostas no browser (só informações não sensíveis)
- Sem prefixo → disponíveis apenas no servidor (seguras para secrets)

---

## 6. Estrutura de pastas

```
teamflow/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Rotas protegidas (requerem login)
│   │   │   ├── layout.tsx            # Layout com sidebar + topbar + alertas
│   │   │   ├── dashboard/page.tsx    # Dashboard executivo
│   │   │   ├── collaborators/        # CRUD de colaboradores
│   │   │   ├── grid/page.tsx         # Grelha salarial
│   │   │   ├── vacations/page.tsx    # Agenda de férias
│   │   │   └── settings/page.tsx     # Configurações de notificações
│   │   ├── actions/                  # Server Actions
│   │   │   ├── collaborators.ts      # CRUD + status + delete + CSV import
│   │   │   ├── grid.ts               # Atualização de faixas salariais
│   │   │   └── vacations.ts          # Agendamento e controle de férias
│   │   ├── api/
│   │   │   ├── cron/notifications/   # Endpoint para cron de e-mails
│   │   │   └── export/collaborators/ # Exportação CSV/Excel
│   │   ├── login/page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── collaborators/            # Formulários, modais, filtros, CSV import
│   │   ├── grid/                     # Modal de edição da grelha
│   │   ├── vacations/                # Modais de agendamento
│   │   ├── layout/                   # Sidebar, Topbar, AlertsPanel
│   │   └── ui/                       # Badge, Avatar, StatCard, AlertBanner, etc.
│   ├── lib/
│   │   ├── cn.ts                     # Utilitário de classes CSS
│   │   ├── utils.ts                  # Formatadores, calculadores, constantes
│   │   └── supabase/
│   │       ├── server.ts             # Client Supabase para server components
│   │       └── client.ts             # Client Supabase para client components
│   ├── services/
│   │   └── email.ts                  # Templates de e-mail (Resend)
│   ├── types/
│   │   └── index.ts                  # Tipos TypeScript globais
│   └── middleware.ts                 # Proteção de rotas via JWT
├── supabase/
│   └── schema.sql                    # Schema completo do banco de dados
├── docs/
│   ├── manual-do-usuario.md          # Este arquivo de documentação
│   └── documentacao-tecnica.md
├── .env.example                      # Template de variáveis de ambiente
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 7. Banco de dados (Supabase)

### 7.1 Tabelas principais

| Tabela | Descrição |
|--------|-----------|
| `collaborators` | Dados de cada colaborador |
| `salary_grid` | Grelha salarial (12 posições) |
| `vacations` | Períodos aquisitivos e agendamentos de férias |
| `promotion_history` | Histórico de promoções |
| `salary_history` | Histórico de reajustes salariais |
| `notification_settings` | Preferências de notificação por usuário |
| `notification_logs` | Log de e-mails enviados |

### 7.2 Enums do banco

```sql
-- Cargo macro
macro_role: 'junior' | 'pleno' | 'senior'

-- Nível dentro do cargo
grid_level_enum: 1 | 2 | 3 | 4

-- Status do colaborador
collab_status: 'active' | 'vacation' | 'leave' | 'terminated'

-- Status do período de férias
vacation_status: 'not_scheduled' | 'scheduled' | 'ongoing' | 'completed' | 'expired'
```

### 7.3 Row Level Security (RLS)

Todas as tabelas têm RLS habilitado. As políticas permitem:
- **Usuários autenticados:** leitura e escrita em todos os registros
- **Service role:** acesso irrestrito (usado pelo cron job)

Para visualizar ou editar as políticas:
1. Acesse o painel do Supabase
2. Vá em **Table Editor → (tabela) → RLS Policies**

### 7.4 Backup

O Supabase mantém backups automáticos para projetos pagos. Para o free tier, faça backups manuais periodicamente:

```bash
# Via Supabase CLI
supabase db dump --file backup.sql
```

---

## 8. Deploy na Vercel

### 8.1 Primeiro deploy

1. Acesse [vercel.com](https://vercel.com) e importe o repositório
2. Na tela de configuração do projeto:
   - Framework: **Next.js** (detectado automaticamente)
   - Build Command: `npm run build`
   - Output Directory: `.next`
3. Adicione todas as variáveis de ambiente da seção 5
4. Clique em **Deploy**

### 8.2 Variáveis de ambiente na Vercel

1. Acesse o projeto na Vercel
2. Vá em **Settings → Environment Variables**
3. Adicione cada variável do `.env.local`
4. Marque os ambientes: **Production**, **Preview**, **Development**
5. Clique em **Save** e faça um novo deploy

> ⚠️ Após adicionar variáveis, é necessário fazer um **novo deploy** para que entrem em vigor.

### 8.3 Domínio personalizado

1. No painel da Vercel, vá em **Settings → Domains**
2. Adicione seu domínio (ex.: `teamflow.suaempresa.com.br`)
3. Configure os registros DNS conforme instruções da Vercel
4. Atualize `NEXT_PUBLIC_APP_URL` para o novo domínio
5. Faça um novo deploy

### 8.4 Atualizações

Cada `git push` para a branch `main` dispara automaticamente um novo deploy na Vercel.

---

## 9. Cron job de notificações

O sistema envia e-mails automáticos via o endpoint `GET /api/cron/notifications`.

### 9.1 O que o cron envia

- **Alerta de férias vencendo:** colaboradores com férias a vencer em menos de N dias
- **Alerta sem promoção:** colaboradores sem promoção há mais de N meses
- **Aniversários de empresa:** colaboradores completando anos nos próximos N dias

Os thresholds são configuráveis na tela de Configurações do sistema.

### 9.2 Configurar na Vercel (recomendado)

Crie o arquivo `vercel.json` na raiz (ou atualize se já existir):

```json
{
  "crons": [
    {
      "path": "/api/cron/notifications",
      "schedule": "0 8 * * 1"
    }
  ]
}
```

> Este exemplo executa toda **segunda-feira às 8h UTC** (5h Brasília).  
> Ajuste o horário conforme necessário. Use [crontab.guru](https://crontab.guru) para montar o schedule.

A Vercel envia automaticamente o header `Authorization: Bearer <CRON_SECRET>`.

### 9.3 Testar manualmente

```bash
curl -X GET \
  https://seudominio.vercel.app/api/cron/notifications \
  -H "Authorization: Bearer <CRON_SECRET>"
```

Resposta esperada:
```json
{
  "ok": true,
  "logs": [
    { "type": "vacation_expiry", "status": "sent", "count": 3 },
    { "type": "no_promotion", "status": "sent", "count": 2 }
  ]
}
```

---

## 10. Segurança e LGPD

### 10.1 Autenticação

- Gerenciada pelo Supabase Auth (JWT com expiração configurável)
- Middleware valida o token em todas as rotas protegidas
- Sem token válido → redirecionamento para `/login`
- Logout invalida a sessão no Supabase

### 10.2 Dados sensíveis

- Senhas: nunca armazenadas (gerenciadas pelo Supabase Auth com bcrypt)
- Chaves da API: apenas em variáveis de ambiente server-side
- `NEXT_PUBLIC_*`: somente URLs e chaves de leitura pública (anon key)
- Service Role Key: nunca exposta ao browser

### 10.3 RLS (Row Level Security)

O Supabase garante que usuários não autenticados não conseguem ler ou escrever dados mesmo acessando a API diretamente.

### 10.4 LGPD

O sistema armazena dados pessoais dos colaboradores (nome, e-mail, salário, datas). Recomendações:

- **Consentimento:** garanta que os colaboradores saibam que seus dados são armazenados
- **Acesso restrito:** limite o acesso ao sistema a usuários que realmente precisam
- **Exclusão:** use a função "Excluir colaborador" para remover dados de ex-colaboradores quando solicitado
- **Backup:** defina política de retenção de dados de acordo com a política da empresa

---

## 11. Manutenção comum

### Adicionar um novo usuário ao sistema

1. No painel do Supabase → **Authentication → Users**
2. Clique em **Invite user**
3. Informe o e-mail — o usuário receberá um link para definir a senha

### Redefinir senha de um usuário

1. No painel do Supabase → **Authentication → Users**
2. Localize o usuário
3. Clique nos três pontos → **Send password reset**

### Ver logs de erros

1. No painel da Vercel → seu projeto → **Functions**
2. Selecione a rota com erro
3. Veja os logs em tempo real ou histórico

### Atualizar dependências

```bash
npm outdated          # ver o que está desatualizado
npm update            # atualizar patch versions
npm install pacote@latest  # atualizar uma dependência específica
npm run build         # sempre verificar o build após atualizar
```

### Fazer backup do banco

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Dump do banco
supabase db dump --project-ref <ref-do-projeto> > backup-$(date +%Y%m%d).sql
```

---

**URL de produção:** https://teamflow-pearl-seven.vercel.app

*Documentação técnica — TeamFlow v1.0 · Abril de 2026*
