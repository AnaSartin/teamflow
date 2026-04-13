# TeamFlow — Gestão de Colaboradores

Sistema interno para gestão de equipe de suporte/implantação.

## Stack

- **Front-end**: Next.js 15 · React 18 · TypeScript · Tailwind CSS
- **Back-end/Banco**: Supabase (PostgreSQL + Auth)
- **E-mail**: Resend
- **Deploy**: Vercel

## Funcionalidades

- ✅ Autenticação real (Supabase Auth)
- ✅ Dashboard executivo com alertas automáticos
- ✅ CRUD completo de colaboradores
- ✅ Grelha salarial configurável (12 posições: Júnior/Pleno/Sênior × N1–N4)
- ✅ Controle de férias com lógica de vencimento (CLT)
- ✅ Histórico de promoções e reajustes salariais
- ✅ Notificações automáticas por e-mail (cron diário)
- ✅ Filtros e pesquisa avançada
- ✅ Design responsivo corporativo

## Setup rápido

```bash
npm install
cp .env.example .env.local
# Preencha .env.local com suas credenciais
npm run dev
```

Consulte [`docs/DEPLOY.md`](./docs/DEPLOY.md) para o guia completo de produção.

## Licença

Uso interno. Não distribuir.
