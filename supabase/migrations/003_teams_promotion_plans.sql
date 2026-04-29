-- ─── 003: Equipes, Nível de Equipe, Inteligência de Férias e Planos de Promoção
-- Execute no Supabase SQL Editor

-- ─── TEAMS ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS teams (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  type       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name)
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teams_auth_all" ON teams
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Semente: importa equipes únicas já existentes nos colaboradores
INSERT INTO teams (name)
SELECT DISTINCT TRIM(team)
FROM collaborators
WHERE TRIM(COALESCE(team, '')) != ''
ON CONFLICT (name) DO NOTHING;

-- Adiciona FK e nível de equipe aos colaboradores
ALTER TABLE collaborators
  ADD COLUMN IF NOT EXISTS team_id    UUID REFERENCES teams(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS team_level TEXT CHECK (team_level IN ('N1', 'N2', 'Coordenação'));

-- Liga colaboradores existentes à sua equipe via texto
UPDATE collaborators c
SET team_id = t.id
FROM teams t
WHERE TRIM(c.team) = t.name
  AND c.team_id IS NULL;

-- Inteligência de férias: data da última vez que as férias foram concluídas
ALTER TABLE collaborators
  ADD COLUMN IF NOT EXISTS last_vacation_date DATE;

-- Popula last_vacation_date com o scheduled_end mais recente das férias concluídas
UPDATE collaborators c
SET last_vacation_date = sub.max_date
FROM (
  SELECT
    collaborator_id,
    MAX(scheduled_end::date) AS max_date
  FROM vacations
  WHERE status = 'completed' AND scheduled_end IS NOT NULL
  GROUP BY collaborator_id
) sub
WHERE c.id = sub.collaborator_id;

-- ─── PROMOTION PLANS ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS promotion_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id UUID NOT NULL REFERENCES collaborators(id) ON DELETE CASCADE,
  new_macro_role  TEXT NOT NULL,
  new_grid_level  INTEGER NOT NULL CHECK (new_grid_level >= 1),
  new_full_title  TEXT NOT NULL,
  new_salary      NUMERIC(12,2) NOT NULL CHECK (new_salary > 0),
  effective_date  DATE NOT NULL,
  status          TEXT NOT NULL DEFAULT 'planned'
                    CHECK (status IN ('planned', 'applied', 'cancelled')),
  notes           TEXT,
  created_by      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE promotion_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promotion_plans_auth_all" ON promotion_plans
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
