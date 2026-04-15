-- ─────────────────────────────────────────────────────────────────────────────
-- TeamFlow — Migration 001: Security Hardening
-- Execute no SQL Editor do Supabase (Settings → SQL Editor)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Adicionar performed_by_email nas tabelas de histórico crítico
--    (quem executou cada promoção / reajuste salarial)

ALTER TABLE promotion_history
  ADD COLUMN IF NOT EXISTS performed_by_email TEXT;

ALTER TABLE salary_history
  ADD COLUMN IF NOT EXISTS performed_by_email TEXT;

-- 2. Tabela de auditoria geral (status, grelha, férias, exclusões)

CREATE TABLE IF NOT EXISTS audit_log (
  id             uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_time     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  performed_by   TEXT        NOT NULL,
  entity         TEXT        NOT NULL,  -- 'collaborator' | 'salary_grid' | 'vacation'
  entity_id      TEXT,
  entity_name    TEXT,                  -- nome legível (ex: nome do colaborador)
  action         TEXT        NOT NULL,  -- 'status_change' | 'grid_update' | 'vacation_schedule' | 'delete' | ...
  details        JSONB,                 -- payload relevante sem dados excessivos
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_time         ON audit_log(event_time DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_performed_by ON audit_log(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity       ON audit_log(entity, entity_id);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log FORCE ROW LEVEL SECURITY;

-- Usuários autenticados podem ler e inserir (mas não alterar nem excluir)
CREATE POLICY "auth_select_audit" ON audit_log
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "auth_insert_audit" ON audit_log
  FOR INSERT TO authenticated WITH CHECK (true);

-- 3. FORCE ROW LEVEL SECURITY em salary_grid (estava faltando)

ALTER TABLE salary_grid FORCE ROW LEVEL SECURITY;

-- 4. Política de INSERT em notification_logs para cron via service_role
--    (service_role bypassa RLS, então é só documentação — não altera comportamento)
--    INSERT na tabela já funciona via service_role; adicionar política explícita
--    impede que usuários comuns insiram logs falsos:

DROP POLICY IF EXISTS "auth_insert_notif_log" ON notification_logs;
CREATE POLICY "auth_insert_notif_log" ON notification_logs
  FOR INSERT TO authenticated WITH CHECK (false);  -- somente service_role pode inserir

-- 5. Remover permissão de DELETE em notification_logs para usuários comuns

DROP POLICY IF EXISTS "auth_delete_notif_log" ON notification_logs;
-- (nenhuma política de DELETE = nenhum usuário comum pode deletar logs)
