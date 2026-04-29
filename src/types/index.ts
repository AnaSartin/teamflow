// ─── Enums / Literals ─────────────────────────────────────────────────────────

export type MacroRole = 'junior' | 'pleno' | 'senior' | (string & {})
export type GridLevel = number
export type CollaboratorStatus = 'active' | 'vacation' | 'leave' | 'terminated'
export type VacationStatus = 'not_scheduled' | 'scheduled' | 'ongoing' | 'completed' | 'expired'
export type PromotionPlanStatus = 'planned' | 'applied' | 'cancelled'

// ─── Teams ────────────────────────────────────────────────────────────────────

export interface Team {
  id: string
  name: string
  type: string | null
  created_at: string
  updated_at: string
}

// ─── Database row types (mirrors Supabase schema) ─────────────────────────────

export interface Collaborator {
  id: string
  name: string
  email: string
  macro_role: MacroRole
  grid_level: GridLevel
  full_title: string
  team: string
  team_id: string | null
  team_level: string | null          // 'N1' | 'N2' | 'Coordenação' | null
  manager: string
  admission_date: string             // ISO date
  current_salary: number
  last_raise_date: string | null
  last_promotion_date: string | null
  last_vacation_date: string | null  // ISO date of last completed vacation
  next_level_forecast: string | null
  promotion_forecast_date: string | null
  status: CollaboratorStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface GridPosition {
  id: string
  macro_role: MacroRole
  grid_level: GridLevel
  full_title: string
  salary_min: number
  salary_max: number
  notes: string | null
  updated_at: string
}

export interface Vacation {
  id: string
  collaborator_id: string
  acquisition_start: string       // início do período aquisitivo
  acquisition_end: string         // fim do período aquisitivo (1 ano após início)
  expiry_date: string             // vencimento (2 anos após admissão do período)
  scheduled_start: string | null
  scheduled_end: string | null
  status: VacationStatus
  notes: string | null
  created_at: string
  updated_at: string
  // joined
  collaborator?: Collaborator
}

export interface PromotionHistory {
  id: string
  collaborator_id: string
  event_date: string
  previous_macro_role: MacroRole | null
  previous_level: GridLevel | null
  new_macro_role: MacroRole
  new_level: GridLevel
  salary_before: number
  salary_after: number
  notes: string | null
  created_at: string
}

export interface SalaryHistory {
  id: string
  collaborator_id: string
  event_date: string
  salary_before: number
  salary_after: number
  reason: string
  created_at: string
}

// ─── Promotion Plans ──────────────────────────────────────────────────────────

export interface PromotionPlan {
  id: string
  collaborator_id: string
  new_macro_role: MacroRole
  new_grid_level: GridLevel
  new_full_title: string
  new_salary: number
  effective_date: string            // ISO date
  status: PromotionPlanStatus
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // joined
  collaborator?: Pick<Collaborator, 'id' | 'name' | 'team' | 'current_salary' | 'macro_role' | 'grid_level'>
}

export interface NotificationSetting {
  id: string
  user_id: string
  notify_vacation_expiring_days: number   // days before expiry to alert
  notify_no_promotion_months: number      // months without promotion
  notify_anniversary_days: number         // days before work anniversary
  email_enabled: boolean
  email_recipients: string[]
  updated_at: string
}

export interface NotificationLog {
  id: string
  type: string
  collaborator_id: string | null
  sent_to: string
  subject: string
  status: 'sent' | 'failed'
  error: string | null
  created_at: string
}

// ─── Computed / View types ────────────────────────────────────────────────────

export interface CollaboratorWithMeta extends Collaborator {
  tenure_text: string             // "3a 4m"
  months_since_promotion: number
  months_since_raise: number
  vacation?: Vacation
  vacation_status?: VacationStatus
  vacation_expiry_days?: number   // days until/since expiry (negative = expired)
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_active: number
  by_macro: Record<string, number>
  by_level: Record<string, number>
  on_vacation: number
  vacations_expiring_soon: number   // within 90 days
  vacations_expired: number
  no_promotion_alert: number        // > 18 months
  raise_due: number                 // forecast within 60 days
}

// ─── Forms ────────────────────────────────────────────────────────────────────

export interface CollaboratorFormValues {
  name: string
  email: string
  macro_role: MacroRole
  grid_level: GridLevel
  team: string
  team_id: string | null
  team_level: string | null
  manager: string
  admission_date: string
  current_salary: number
  last_raise_date: string
  last_promotion_date: string
  next_level_forecast: string
  promotion_forecast_date: string
  status: CollaboratorStatus
  notes: string
}

export interface VacationFormValues {
  collaborator_id: string
  acquisition_start: string
  scheduled_start: string
  scheduled_end: string
  notes: string
}
