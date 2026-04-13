-- ─────────────────────────────────────────────────────────────────────────────
-- TeamFlow — Supabase PostgreSQL Schema
-- Execute este SQL no SQL Editor do Supabase (em ordem)
-- ─────────────────────────────────────────────────────────────────────────────

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ENUMS ───────────────────────────────────────────────────────────────────

CREATE TYPE macro_role      AS ENUM ('junior', 'pleno', 'senior');
CREATE TYPE grid_level_enum AS ENUM ('1', '2', '3', '4');
CREATE TYPE collab_status   AS ENUM ('active', 'vacation', 'leave', 'terminated');
CREATE TYPE vacation_status AS ENUM ('not_scheduled', 'scheduled', 'ongoing', 'completed', 'expired');

-- ─── SALARY GRID ─────────────────────────────────────────────────────────────

CREATE TABLE salary_grid (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  macro_role  macro_role NOT NULL,
  grid_level  INTEGER NOT NULL CHECK (grid_level BETWEEN 1 AND 4),
  full_title  TEXT NOT NULL,
  salary_min  NUMERIC(10,2) NOT NULL,
  salary_max  NUMERIC(10,2) NOT NULL,
  notes       TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (macro_role, grid_level)
);

-- Populate default grid
INSERT INTO salary_grid (macro_role, grid_level, full_title, salary_min, salary_max) VALUES
  ('junior', 1, 'Analista de Suporte Júnior 1',  2800, 3200),
  ('junior', 2, 'Analista de Suporte Júnior 2',  3200, 3700),
  ('junior', 3, 'Analista de Suporte Júnior 3',  3700, 4300),
  ('junior', 4, 'Analista de Suporte Júnior 4',  4300, 5000),
  ('pleno',  1, 'Analista de Suporte Pleno 1',   5000, 5800),
  ('pleno',  2, 'Analista de Suporte Pleno 2',   5800, 6700),
  ('pleno',  3, 'Analista de Suporte Pleno 3',   6700, 7700),
  ('pleno',  4, 'Analista de Suporte Pleno 4',   7700, 9000),
  ('senior', 1, 'Analista de Suporte Sênior 1',  9000,  10500),
  ('senior', 2, 'Analista de Suporte Sênior 2',  10500, 12000),
  ('senior', 3, 'Analista de Suporte Sênior 3',  12000, 13800),
  ('senior', 4, 'Analista de Suporte Sênior 4',  13800, 16000);

-- ─── COLLABORATORS ────────────────────────────────────────────────────────────

CREATE TABLE collaborators (
  id                      uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                    TEXT NOT NULL,
  email                   TEXT NOT NULL UNIQUE,
  macro_role              macro_role NOT NULL,
  grid_level              INTEGER NOT NULL CHECK (grid_level BETWEEN 1 AND 4),
  full_title              TEXT NOT NULL,
  team                    TEXT NOT NULL DEFAULT '',
  manager                 TEXT NOT NULL DEFAULT '',
  admission_date          DATE NOT NULL,
  current_salary          NUMERIC(10,2) NOT NULL,
  last_raise_date         DATE,
  last_promotion_date     DATE,
  next_level_forecast     TEXT,
  promotion_forecast_date DATE,
  status                  collab_status NOT NULL DEFAULT 'active',
  notes                   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collaborators_status     ON collaborators(status);
CREATE INDEX idx_collaborators_macro_role ON collaborators(macro_role);
CREATE INDEX idx_collaborators_team       ON collaborators(team);
CREATE INDEX idx_collaborators_name       ON collaborators USING gin(to_tsvector('portuguese', name));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

CREATE TRIGGER trg_collaborators_updated
  BEFORE UPDATE ON collaborators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── VACATIONS ────────────────────────────────────────────────────────────────

CREATE TABLE vacations (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  collaborator_id     uuid NOT NULL REFERENCES collaborators(id) ON DELETE CASCADE,
  acquisition_start   DATE NOT NULL,
  acquisition_end     DATE NOT NULL,  -- acquisition_start + 1 year
  expiry_date         DATE NOT NULL,  -- acquisition_end + 1 year (CLT: 2 years total)
  scheduled_start     DATE,
  scheduled_end       DATE,
  status              vacation_status NOT NULL DEFAULT 'not_scheduled',
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vacations_collaborator ON vacations(collaborator_id);
CREATE INDEX idx_vacations_expiry       ON vacations(expiry_date);
CREATE INDEX idx_vacations_status       ON vacations(status);

CREATE TRIGGER trg_vacations_updated
  BEFORE UPDATE ON vacations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── PROMOTION HISTORY ───────────────────────────────────────────────────────

CREATE TABLE promotion_history (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  collaborator_id       uuid NOT NULL REFERENCES collaborators(id) ON DELETE CASCADE,
  event_date            DATE NOT NULL,
  previous_macro_role   macro_role,
  previous_level        INTEGER,
  new_macro_role        macro_role NOT NULL,
  new_level             INTEGER NOT NULL,
  salary_before         NUMERIC(10,2) NOT NULL,
  salary_after          NUMERIC(10,2) NOT NULL,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_promotion_collaborator ON promotion_history(collaborator_id);

-- ─── SALARY HISTORY ──────────────────────────────────────────────────────────

CREATE TABLE salary_history (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  collaborator_id uuid NOT NULL REFERENCES collaborators(id) ON DELETE CASCADE,
  event_date      DATE NOT NULL,
  salary_before   NUMERIC(10,2) NOT NULL,
  salary_after    NUMERIC(10,2) NOT NULL,
  reason          TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_salary_collaborator ON salary_history(collaborator_id);

-- ─── NOTIFICATION SETTINGS ───────────────────────────────────────────────────

CREATE TABLE notification_settings (
  id                               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                          uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  notify_vacation_expiring_days    INTEGER NOT NULL DEFAULT 90,
  notify_no_promotion_months       INTEGER NOT NULL DEFAULT 18,
  notify_anniversary_days          INTEGER NOT NULL DEFAULT 30,
  email_enabled                    BOOLEAN NOT NULL DEFAULT TRUE,
  email_recipients                 TEXT[] NOT NULL DEFAULT '{}',
  updated_at                       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── NOTIFICATION LOGS ───────────────────────────────────────────────────────

CREATE TABLE notification_logs (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type            TEXT NOT NULL,
  collaborator_id uuid REFERENCES collaborators(id) ON DELETE SET NULL,
  sent_to         TEXT NOT NULL,
  subject         TEXT NOT NULL DEFAULT '',
  status          TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  error           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_logs_created ON notification_logs(created_at DESC);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE collaborators          ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacations               ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_history       ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_history          ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_grid             ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs       ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can read/write everything
-- (In production, scope further to specific user roles if needed)

CREATE POLICY "auth_read"  ON collaborators        FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_write" ON collaborators        FOR ALL    TO authenticated USING (true);

CREATE POLICY "auth_read"  ON vacations             FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_write" ON vacations             FOR ALL    TO authenticated USING (true);

CREATE POLICY "auth_read"  ON promotion_history     FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_write" ON promotion_history     FOR ALL    TO authenticated USING (true);

CREATE POLICY "auth_read"  ON salary_history        FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_write" ON salary_history        FOR ALL    TO authenticated USING (true);

CREATE POLICY "auth_read"  ON salary_grid           FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_write" ON salary_grid           FOR ALL    TO authenticated USING (true);

CREATE POLICY "own_settings" ON notification_settings
  FOR ALL TO authenticated USING (user_id = auth.uid());

CREATE POLICY "auth_read" ON notification_logs
  FOR SELECT TO authenticated USING (true);

-- Service role can bypass RLS (needed for cron job)
ALTER TABLE collaborators        FORCE ROW LEVEL SECURITY;
ALTER TABLE vacations             FORCE ROW LEVEL SECURITY;
ALTER TABLE promotion_history     FORCE ROW LEVEL SECURITY;
ALTER TABLE salary_history        FORCE ROW LEVEL SECURITY;
ALTER TABLE notification_settings FORCE ROW LEVEL SECURITY;
ALTER TABLE notification_logs     FORCE ROW LEVEL SECURITY;

-- ─── SAMPLE DATA ─────────────────────────────────────────────────────────────
-- Remove or adjust before production use

INSERT INTO collaborators (name, email, macro_role, grid_level, full_title, team, manager, admission_date, current_salary, last_raise_date, last_promotion_date, status, notes) VALUES
('Adriel Ricardo Vidal',              'adriel.vidal@adaptive.com.br',     'junior', 2, 'Analista de Suporte Júnior 2', '0401 - Suporte ao Cliente', 'João Gestor', '2021-03-28', 3500, '2024-01-15', '2023-06-10', 'active', 'Ótimo desempenho técnico.'),
('Álvaro dos Reis Rodrigues',         'alvaro.rodrigues@adaptive.com.br', 'pleno',  1, 'Analista de Suporte Pleno 1',  '0401 - Suporte ao Cliente', 'João Gestor', '2019-09-24', 5200, '2025-01-10', '2024-08-15', 'active', NULL),
('Ana Beatriz Pereira Chaves',        'anabeatriz.chaves@adaptive.com.br','junior', 3, 'Analista de Suporte Júnior 3', '0401 - Suporte ao Cliente', 'João Gestor', '2022-11-06', 4100, '2025-02-01', '2025-01-15', 'vacation', 'Em férias até 30/04.'),
('Ana Caroline Silva Sartin',         'ana.sartin@adaptive.com.br',       'junior', 1, 'Analista de Suporte Júnior 1', '0401 - Suporte ao Cliente', 'João Gestor', '2023-11-06', 2900, '2025-03-01', NULL,         'active', 'Ingresso recente.'),
('Anderson Oliveira Pereira',         'anderson.pereira@adaptive.com.br', 'junior', 2, 'Analista de Suporte Júnior 2', '0401 - Suporte ao Cliente', 'João Gestor', '2021-11-06', 3400, '2023-08-01', '2022-05-10', 'active', 'Promoção pendente de análise.'),
('Antônio Geraldo de Queiroz Neto',   'antonio.neto@adaptive.com.br',     'pleno',  2, 'Analista de Suporte Pleno 2',  '0401 - Suporte ao Cliente', 'João Gestor', '2020-07-19', 6200, '2025-06-01', '2024-02-20', 'active', NULL),
('Beatriz Rodrigues Leal de Araujo',  'beatriz.araujo@adaptive.com.br',   'senior', 1, 'Analista de Suporte Sênior 1', '0401 - Suporte ao Cliente', 'João Gestor', '2018-06-23', 9500, '2025-01-15', '2024-11-01', 'active', 'Referência técnica da equipe.'),
('Cleusa Taisa Santos Alves Oliveira','cleusa.oliveira@adaptive.com.br',  'junior', 4, 'Analista de Suporte Júnior 4', '0401 - Suporte ao Cliente', 'João Gestor', '2021-04-09', 4800, '2025-04-01', '2025-03-15', 'active', 'Candidata à promoção para Pleno.'),
('Estefane dos Santos Moreira',       'estefane.santos@adaptive.com.br',  'junior', 1, 'Analista de Suporte Júnior 1', '0401 - Suporte ao Cliente', 'João Gestor', '2022-01-22', 3000, '2024-03-01', NULL,         'active', 'Férias vencidas — requer ação.'),
('Fábio Borges Menegatti',            'fabio.menegatti@adaptive.com.br',  'pleno',  3, 'Analista de Suporte Pleno 3',  '0401 - Suporte ao Cliente', 'João Gestor', '2019-10-05', 7400, '2025-03-15', '2024-05-20', 'active', NULL),
('Guilherme Junio de Oliveira Silva', 'guilherme.junio@adaptive.com.br',  'senior', 2, 'Analista de Suporte Sênior 2', '0401 - Suporte ao Cliente', 'João Gestor', '2017-11-11', 11200,'2025-01-10', '2025-02-01', 'active', 'Líder técnico informal.'),
('Luiz Eduardo Velozo',               'luiz.velozo@adaptive.com.br',      'junior', 3, 'Analista de Suporte Júnior 3', '0401 - Suporte ao Cliente', 'João Gestor', '2022-02-21', 3900, '2024-05-01', '2023-11-10', 'active', 'Reajuste pendente.'),
('Maurício Quirino Marques Junior',   'mauricio.junior@adaptive.com.br',  'senior', 3, 'Analista de Suporte Sênior 3', '0401 - Suporte ao Cliente', 'João Gestor', '2016-02-08', 13000,'2025-02-01', '2025-01-20', 'active', 'Especialista sênior.');

-- Add vacation records for collaborators
-- Ana Beatriz (em férias)
INSERT INTO vacations (collaborator_id, acquisition_start, acquisition_end, expiry_date, scheduled_start, scheduled_end, status)
SELECT id, '2024-11-06', '2025-11-06', '2026-11-06', '2026-04-01', '2026-04-30', 'ongoing'
FROM collaborators WHERE email = 'anabeatriz.chaves@adaptive.com.br';

-- Estefane (férias vencidas)
INSERT INTO vacations (collaborator_id, acquisition_start, acquisition_end, expiry_date, scheduled_start, scheduled_end, status)
SELECT id, '2023-01-22', '2024-01-22', '2025-01-22', NULL, NULL, 'expired'
FROM collaborators WHERE email = 'estefane.santos@adaptive.com.br';

-- Anderson (vencendo em breve)
INSERT INTO vacations (collaborator_id, acquisition_start, acquisition_end, expiry_date, scheduled_start, scheduled_end, status)
SELECT id, '2024-11-06', '2025-11-06', '2026-08-10', NULL, NULL, 'not_scheduled'
FROM collaborators WHERE email = 'anderson.pereira@adaptive.com.br';

-- Álvaro (agendada)
INSERT INTO vacations (collaborator_id, acquisition_start, acquisition_end, expiry_date, scheduled_start, scheduled_end, status)
SELECT id, '2024-09-24', '2025-09-24', '2026-08-26', '2026-06-01', '2026-06-30', 'scheduled'
FROM collaborators WHERE email = 'alvaro.rodrigues@adaptive.com.br';
