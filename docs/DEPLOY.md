# TeamFlow — Guia completo de deploy e configuração

## Visão geral da arquitetura

```
Usuário → Vercel (Next.js 15) → Supabase (PostgreSQL + Auth)
                              → Resend (e-mails transacionais)
Vercel Cron (8h dias úteis)   → /api/cron/notifications
```

---

## 1. Pré-requisitos

- Node.js 18+ instalado localmente
- Conta Vercel (gratuita serve para começar)
- Conta Supabase (gratuita)
- Conta Resend (gratuita até 3.000 e-mails/mês)
- Git instalado

---

## 2. Configurar o Supabase

### 2.1 Criar projeto

1. Acesse https://supabase.com e clique em **New project**
2. Escolha nome, senha do banco (guarde) e região **South America (São Paulo)** se disponível, senão **US East**
3. Aguarde o projeto inicializar (~2 min)

### 2.2 Executar o schema SQL

1. No painel do Supabase, vá em **SQL Editor → New query**
2. Cole o conteúdo completo de `supabase/schema.sql`
3. Clique em **Run**
4. Verifique se todas as tabelas foram criadas em **Table Editor**

### 2.3 Criar o primeiro usuário (você, o gestor)

1. No Supabase, vá em **Authentication → Users**
2. Clique em **Add user → Create new user**
3. Informe seu e-mail corporativo e uma senha segura
4. O usuário já pode fazer login na aplicação

### 2.4 Coletar as credenciais

No painel do Supabase, vá em **Settings → API**:

| Variável | Onde encontrar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (⚠ nunca expor no front) |

---

## 3. Configurar o Resend (e-mail)

### 3.1 Criar conta e domínio

1. Acesse https://resend.com e crie uma conta gratuita
2. Vá em **Domains → Add Domain**
3. Adicione seu domínio corporativo (ex: `adaptive.com.br`)
4. Siga as instruções para adicionar os registros DNS (TXT + MX)
5. Aguarde a verificação (pode levar até 24h, geralmente minutos)

### 3.2 Criar API Key

1. Vá em **API Keys → Create API Key**
2. Nomeie como `teamflow-production`
3. Permissão: **Sending access**
4. Copie a chave gerada (começa com `re_`)

> **Alternativa sem domínio próprio**: Para testes, o Resend permite enviar de `onboarding@resend.dev` sem verificar domínio. Basta usar esse endereço em `EMAIL_FROM`.

---

## 4. Rodar localmente

```bash
# 1. Entrar na pasta do projeto
cd teamflow

# 2. Instalar dependências
npm install

# 3. Copiar variáveis de ambiente
cp .env.example .env.local

# 4. Preencher o .env.local com seus valores reais
# (veja seção 5 abaixo)

# 5. Rodar em modo desenvolvimento
npm run dev

# Acesse: http://localhost:3000
```

---

## 5. Variáveis de ambiente

Preencha o arquivo `.env.local` (desenvolvimento) e configure as mesmas variáveis no Vercel (produção):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# E-mail
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@suaempresa.com.br
EMAIL_MANAGER=gestor@suaempresa.com.br

# App
NEXT_PUBLIC_APP_URL=https://teamflow.vercel.app
NEXT_PUBLIC_COMPANY_NAME=Adaptive

# Cron
CRON_SECRET=gere_uma_string_aleatoria_longa_aqui
```

Para gerar um `CRON_SECRET` seguro:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 6. Deploy no Vercel

### 6.1 Via GitHub (recomendado)

```bash
# Inicializar repositório
git init
git add .
git commit -m "feat: initial TeamFlow setup"

# Criar repositório no GitHub e conectar
git remote add origin https://github.com/SEUSUSUARIO/teamflow.git
git push -u origin main
```

1. Acesse https://vercel.com e clique em **Add New → Project**
2. Importe o repositório do GitHub
3. Em **Environment Variables**, adicione todas as variáveis do `.env.local`
4. Clique em **Deploy**

### 6.2 Via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
# Siga as instruções interativas
# Adicione as variáveis de ambiente quando solicitado
```

### 6.3 Domínio customizado (opcional)

No painel da Vercel:
1. Vá em **Settings → Domains**
2. Adicione seu domínio (ex: `teamflow.adaptive.com.br`)
3. Configure o CNAME no seu provedor DNS apontando para `cname.vercel-dns.com`
4. Atualize `NEXT_PUBLIC_APP_URL` com o novo domínio

---

## 7. Configurar notificações automáticas (Cron)

### Opção A: Vercel Cron (plano Pro — $20/mês)

O arquivo `vercel.json` já está configurado para rodar às 8h de segunda a sexta:

```json
{
  "crons": [{
    "path": "/api/cron/notifications",
    "schedule": "0 8 * * 1-5"
  }]
}
```

O Vercel envia automaticamente o header `Authorization: Bearer {CRON_SECRET}`.

### Opção B: cron-job.org (gratuito)

1. Acesse https://cron-job.org e crie uma conta gratuita
2. Crie um novo cron job:
   - **URL**: `https://seusite.vercel.app/api/cron/notifications`
   - **Schedule**: Todos os dias úteis às 8h
   - **Headers**: `Authorization: Bearer SEU_CRON_SECRET`
3. Salve e ative

### Opção C: GitHub Actions (gratuito)

Crie `.github/workflows/notify.yml`:

```yaml
name: Daily notifications
on:
  schedule:
    - cron: '0 11 * * 1-5'  # 8h BRT = 11h UTC
jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger notification cron
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://seusite.vercel.app/api/cron/notifications
```

Adicione `CRON_SECRET` em **GitHub → Settings → Secrets → Actions**.

---

## 8. Primeiro acesso e configuração inicial

### 8.1 Acessar a aplicação

1. Acesse a URL do Vercel (ou seu domínio customizado)
2. Faça login com o usuário criado no Supabase
3. Você verá o dashboard com os dados de exemplo

### 8.2 Configurar notificações

1. Vá em **Configurações** (menu lateral)
2. Configure os destinatários de e-mail (seu e-mail corporativo)
3. Ajuste os limites de alertas conforme sua política
4. Salve

### 8.3 Remover dados de exemplo (produção)

No Supabase SQL Editor:
```sql
-- Remove os dados de exemplo antes de usar em produção
DELETE FROM vacations;
DELETE FROM collaborators;
-- Os dados da salary_grid podem ser mantidos e editados
```

### 8.4 Cadastrar colaboradores reais

Use a interface em **Colaboradores → Novo colaborador** ou importe via SQL:

```sql
INSERT INTO collaborators (
  name, email, macro_role, grid_level, full_title,
  team, manager, admission_date, current_salary, status
) VALUES (
  'Nome Completo',
  'email@empresa.com.br',
  'junior',  -- ou 'pleno' / 'senior'
  2,         -- nível 1 a 4
  'Analista de Suporte Júnior 2',
  '0401 - Suporte ao Cliente',
  'Nome do Gestor',
  '2023-05-15',
  4200.00,
  'active'
);
```

---

## 9. Atualizar a grelha salarial

No Supabase SQL Editor ou via UI futura:

```sql
UPDATE salary_grid
SET salary_min = 3000, salary_max = 3500, updated_at = NOW()
WHERE macro_role = 'junior' AND grid_level = 1;
```

Ou atualize todos de uma vez:
```sql
UPDATE salary_grid SET
  salary_min = CASE
    WHEN macro_role = 'junior'  AND grid_level = 1 THEN 3000
    WHEN macro_role = 'junior'  AND grid_level = 2 THEN 3500
    -- ... continue para todos os 12 níveis
  END,
  updated_at = NOW()
WHERE macro_role IN ('junior', 'pleno', 'senior');
```

---

## 10. Estrutura de pastas do projeto

```
teamflow/
├── src/
│   ├── app/
│   │   ├── (auth)/                    # Rotas protegidas por autenticação
│   │   │   ├── layout.tsx             # Layout com sidebar + topbar
│   │   │   ├── dashboard/page.tsx     # Dashboard executivo
│   │   │   ├── collaborators/
│   │   │   │   ├── page.tsx           # Lista de colaboradores
│   │   │   │   ├── new/page.tsx       # Cadastro
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx       # Detalhe do colaborador
│   │   │   │       └── edit/page.tsx  # Edição
│   │   │   ├── grid/page.tsx          # Grelha salarial
│   │   │   ├── vacations/page.tsx     # Agenda de férias
│   │   │   └── settings/page.tsx      # Configurações
│   │   ├── login/page.tsx             # Página de login
│   │   ├── api/
│   │   │   └── cron/
│   │   │       └── notifications/route.ts  # Cron de alertas
│   │   ├── actions/
│   │   │   └── collaborators.ts       # Server Actions (CRUD)
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Topbar.tsx
│   │   ├── ui/
│   │   │   └── index.tsx              # Badge, StatCard, Avatar, etc.
│   │   ├── collaborators/
│   │   │   ├── CollaboratorForm.tsx
│   │   │   ├── CollaboratorsFilters.tsx
│   │   │   ├── PromotionModal.tsx
│   │   │   └── RaiseModal.tsx
│   │   └── settings/
│   │       └── SettingsForm.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # Browser client
│   │   │   └── server.ts              # Server + service role client
│   │   ├── utils.ts                   # Business logic, formatters
│   │   └── cn.ts                      # Tailwind merge utility
│   ├── services/
│   │   └── email.ts                   # Templates e envio via Resend
│   ├── types/
│   │   └── index.ts                   # TypeScript types
│   └── middleware.ts                  # Auth protection
├── supabase/
│   └── schema.sql                     # Schema completo PostgreSQL
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json                        # Cron jobs
└── package.json
```

---

## 11. Checklist antes de ir para produção

- [ ] Schema SQL executado no Supabase
- [ ] Usuário gestor criado no Supabase Auth
- [ ] Todas as variáveis de ambiente configuradas no Vercel
- [ ] Domínio verificado no Resend
- [ ] Cron job configurado (Vercel Pro ou cron-job.org)
- [ ] Dados de exemplo removidos
- [ ] Colaboradores reais cadastrados
- [ ] Grelha salarial atualizada com valores reais
- [ ] Teste de envio de e-mail realizado
- [ ] Domínio customizado configurado (opcional)

---

## 12. Próximos passos sugeridos

### Curto prazo
- Adicionar tela de edição da grelha salarial direto na UI (sem precisar do SQL Editor)
- Adicionar formulário de cadastro de férias na tela do colaborador
- Exportar relatório de colaboradores em CSV/Excel

### Médio prazo
- Login com Google Workspace (`signInWithOAuth({ provider: 'google' })`)
- Perfis de acesso (admin vs. visualização)
- Histórico de auditoria (who changed what)
- Notificações in-app (bell icon no topbar)

### Longo prazo
- Importação em lote via CSV
- Integração com folha de pagamento
- Módulo de metas e avaliação de desempenho
- App mobile (Capacitor ou React Native)
