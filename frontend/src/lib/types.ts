export interface User {
  id: string;
  email: string;
  full_name?: string | null;
}

export interface CreditCard {
  id: string;
  bank: string;
  card_name: string;
  card_last4?: string | null;
  network?: string | null;
  credit_limit: number;
  used_amount: number;
  statement_date?: number | null;
  due_date?: number | null;
  interest_rate?: number | null;
  min_due?: number | null;
  reward_points?: number | null;
  annual_fee?: number | null;
  color?: string | null;
  is_active: boolean;
  available_limit: number;
  utilization_pct: number;
}

export type LoanType = "emi" | "loan";

export interface EMI {
  id: string;
  loan_name: string;
  bank?: string | null;
  loan_type: LoanType;
  emi_amount: number;
  emi_day: number;
  interest_rate?: number | null;
  outstanding_principal?: number | null;
  tenure_months?: number | null;
  remaining_months?: number | null;
  total_paid?: number | null;
  is_active: boolean;
}

export type ReminderCategory =
  | "credit_card"
  | "emi"
  | "bill"
  | "subscription"
  | "document"
  | "insurance"
  | "investment"
  | "other";

export interface Reminder {
  id: string;
  title: string;
  category: ReminderCategory;
  due_date: string;
  amount?: number | null;
  notes?: string | null;
  is_recurring: boolean;
  recurrence_days?: number | null;
  is_completed: boolean;
  linked_credit_card_id?: string | null;
  linked_emi_id?: string | null;
}

export interface DashboardSummary {
  total_credit_limit: number;
  total_credit_used: number;
  total_credit_available: number;
  overall_utilization_pct: number;
  cards_over_30pct: number;
  cards_over_70pct: number;
  total_monthly_emi: number;
  upcoming_reminders_7d: Reminder[];
  today_reminders: Reminder[];
  missed_reminders: Reminder[];
  total_monthly_commitments: number;
}
