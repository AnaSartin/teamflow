-- ─────────────────────────────────────────────────────────────────────────────
-- TeamFlow — Migration 002: Dynamic Salary Grid
-- Execute no SQL Editor do Supabase (Settings → SQL Editor)
-- ─────────────────────────────────────────────────────────────────────────────
-- Objetivo: remover a restrição de ENUM em macro_role para permitir cargos
-- customizados (Especialista, Coordenador, etc.) e liberar grid_level > 4.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Converter macro_role de ENUM para TEXT em todas as tabelas dependentes

ALTER TABLE salary_grid
  ALTER COLUMN macro_role TYPE TEXT;

ALTER TABLE collaborators
  ALTER COLUMN macro_role TYPE TEXT;

ALTER TABLE promotion_history
  ALTER COLUMN previous_macro_role TYPE TEXT,
  ALTER COLUMN new_macro_role TYPE TEXT;

-- 2. Remover limite superior do grid_level na salary_grid
--    (permite níveis > 4 para cargos customizados)

ALTER TABLE salary_grid
  DROP CONSTRAINT IF EXISTS salary_grid_grid_level_check;

ALTER TABLE salary_grid
  ADD CONSTRAINT salary_grid_grid_level_check CHECK (grid_level >= 1);

-- 3. O grid_level em collaborators mantém a restrição 1-4 por enquanto.
--    Se precisar liberar para colaboradores também, descomente as linhas abaixo:
-- ALTER TABLE collaborators DROP CONSTRAINT IF EXISTS collaborators_grid_level_check;
-- ALTER TABLE collaborators ADD CONSTRAINT collaborators_grid_level_check CHECK (grid_level >= 1);

-- 4. Remover o tipo ENUM macro_role (já não é mais usado pelas colunas)

DROP TYPE IF EXISTS macro_role CASCADE;
