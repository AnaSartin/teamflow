# TeamFlow — Gestão de Colaboradores

Sistema interno para gestão de equipe: histórico, grelha salarial, férias, promoções e alertas automáticos.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15 (App Router) |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth |
| Estilização | Tailwind CSS |
| E-mails | Resend |
| Deploy | Vercel |

## Funcionalidades

- ✅ Dashboard executivo com KPIs, pirâmide de níveis e visão salarial
- ✅ Sistema de alertas visuais (sino + painel) com prioridades crítico/alto/médio
- ✅ CRUD completo de colaboradores com histórico de promoções e salários
- ✅ Grelha salarial editável (12 posições: Júnior/Pleno/Sênior × N1–N4)
- ✅ Controle de férias com lógica de vencimento CLT e agendamento
- ✅ Filtros avançados + busca multi-campo com debounce
- ✅ Importação em massa via CSV com validação linha a linha
- ✅ Exportação para Excel (CSV UTF-8 BOM, respeita filtros ativos)
- ✅ Notificações automáticas por e-mail via cron (Resend)
- ✅ Autenticação JWT (Supabase Auth) com middleware de proteção de rotas
- ✅ RLS habilitado em todas as tabelas

## Setup rápido

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# edite .env.local com suas credenciais

# Criar banco: execute supabase/schema.sql no SQL Editor do Supabase

# Rodar localmente
npm run dev
```

Acesse `http://localhost:3000` e faça login com usuário criado no Supabase Auth.

## Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
EMAIL_MANAGER=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_COMPANY_NAME=
CRON_SECRET=
```

## Rotas

| Rota | Descrição |
|------|-----------|
| `/dashboard` | Painel executivo com KPIs e alertas |
| `/collaborators` | Lista, filtros avançados, busca e exportação |
| `/collaborators/new` | Cadastrar colaborador |
| `/collaborators/[id]` | Detalhes, promoção, reajuste, histórico |
| `/grid` | Grelha salarial com edição por linha |
| `/vacations` | Agenda e controle de férias |
| `/settings` | Configurações de notificações |
| `/api/export/collaborators` | Export CSV autenticado (respeita filtros) |
| `/api/cron/notifications` | E-mails automáticos (requer `CRON_SECRET`) |

## Deploy na Vercel

1. Importe o repositório na [Vercel](https://vercel.com)
2. Configure todas as variáveis de ambiente em **Settings → Environment Variables**
3. Para o cron de notificações, adicione ao `vercel.json`:

```json
{
  "crons": [{ "path": "/api/cron/notifications", "schedule": "0 8 * * 1" }]
}
```

## Documentação

| Arquivo | Conteúdo |
|---------|---------|
| [`docs/manual-do-usuario.md`](docs/manual-do-usuario.md) | Manual completo para gestores — todas as telas, passo a passo e boas práticas |
| [`docs/documentacao-tecnica.md`](docs/documentacao-tecnica.md) | Arquitetura, banco de dados, deploy, segurança e manutenção |

## Scripts

```bash
npm run dev     # desenvolvimento
npm run build   # build de produção
npm run start   # servidor de produção
npm run lint    # verificar ESLint
```

---

Uso interno. Não distribuir.
