// Tipos para la base de datos de Supabase

export type UserRole = 'super_admin' | 'admin' | 'gestor' | 'empleado';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos para el CRM de gastos e ingresos

export type Currency = 'CHF' | 'EUR' | 'USD';
export type Frequency = 'one_time' | 'monthly' | 'annual';
export type PaymentStatus = 'paid' | 'pending' | 'upcoming';
export type ClientStatus = 'active' | 'inactive' | 'suspended';

export type ExpenseCategory = 'software' | 'hosting' | 'domain' | 'api' | 'development' | 'other';
export type ClientExpenseCategory = 'domain' | 'hosting' | 'ssl' | 'api' | 'maintenance' | 'other';
export type IncomeCategory = 'web_development' | 'maintenance' | 'hosting' | 'domain' | 'crm' | 'subscription' | 'other';
export type ProjectType = 'web_development' | 'app_development' | 'game_development' | 'ecommerce' | 'maintenance' | 'consulting' | 'design' | 'marketing' | 'seo' | 'hosting' | 'other';
export type ProjectStatus = 'active' | 'completed' | 'paused' | 'cancelled';
export type PaymentType = 'one_time' | 'monthly' | 'annual' | 'milestone';

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  country: string | null;
  status: ClientStatus;
  is_potential: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyExpense {
  id: string;
  service_name: string;
  description: string | null;
  amount: number;
  currency: Currency;
  frequency: Frequency;
  category: ExpenseCategory | null;
  status: PaymentStatus;
  payment_date: string | null;
  renewal_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientExpense {
  id: string;
  client_id: string;
  service_name: string;
  description: string | null;
  amount: number;
  currency: Currency;
  frequency: Frequency;
  category: ClientExpenseCategory | null;
  status: PaymentStatus;
  payment_date: string | null;
  renewal_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientIncome {
  id: string;
  client_id: string;
  service_name: string;
  description: string | null;
  amount: number;
  currency: Currency;
  frequency: Frequency;
  category: IncomeCategory | null;
  status: PaymentStatus;
  payment_date: string | null;
  renewal_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  company_name: string;
  project_name: string;
  description: string | null;
  project_type: ProjectType | null;
  custom_project_type: string | null;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  total_amount: number | null;
  currency: Currency;
  payment_type: PaymentType | null;
  has_professional_email: boolean;
  professional_email: string | null;
  has_website: boolean;
  website_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  milestones?: ProjectMilestone[];
}

export type MilestoneStatus = 'pending' | 'paid' | 'partial';

export interface ProjectMilestone {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  amount: number;
  currency: Currency;
  due_date: string | null;
  paid_date: string | null;
  status: MilestoneStatus;
  paid_amount: number;
  created_at: string;
  updated_at: string;
}

// Tipos extendidos con datos relacionados
export interface ClientWithDetails extends Client {
  expenses?: ClientExpense[];
  income?: ClientIncome[];
  projects?: Project[];
  total_expenses_monthly?: number;
  total_expenses_annual?: number;
  total_income_monthly?: number;
  total_income_annual?: number;
  profit_monthly?: number;
  profit_annual?: number;
}

export interface ClientWithExpenses extends Client {
  expenses?: ClientExpense[];
  total_expenses_monthly?: number;
  total_expenses_annual?: number;
}

export interface ProjectWithClient extends Project {
  client?: Client;
}

// Internal Projects (Syntalys Lab)
export type InternalProjectStatus = 'idea' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';

export interface InternalProject {
  id: string;
  name: string;
  description: string | null;
  status: InternalProjectStatus;
  project_type: ProjectType | null;
  start_date: string | null;
  target_date: string | null;
  repository_url: string | null;
  demo_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Password Manager Types
export type PasswordCategory = 'work' | 'personal' | 'social' | 'banking' | 'email' | 'hosting' | 'development' | 'other';

export interface Password {
  id: string;
  user_id: string;
  service_name: string;
  username: string | null;
  email: string | null;
  password: string;
  url: string | null;
  notes: string | null;
  category: PasswordCategory | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      clients: {
        Row: Client;
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>;
      };
      company_expenses: {
        Row: CompanyExpense;
        Insert: Omit<CompanyExpense, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CompanyExpense, 'id' | 'created_at' | 'updated_at'>>;
      };
      client_expenses: {
        Row: ClientExpense;
        Insert: Omit<ClientExpense, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ClientExpense, 'id' | 'created_at' | 'updated_at'>>;
      };
      client_income: {
        Row: ClientIncome;
        Insert: Omit<ClientIncome, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ClientIncome, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
