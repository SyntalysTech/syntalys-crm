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

export type ExpenseCategory = 'software' | 'hosting' | 'domain' | 'api' | 'development' | 'ia' | 'cloud' | 'security' | 'backup' | 'analytics' | 'marketing' | 'seo' | 'email' | 'communications' | 'storage' | 'infrastructure' | 'licenses' | 'subscriptions' | 'tools' | 'automation' | 'testing' | 'monitoring' | 'cdn' | 'database' | 'payments' | 'advertising' | 'training' | 'support' | 'other';
export type ClientExpenseCategory = 'domain' | 'hosting' | 'ssl' | 'api' | 'maintenance' | 'other';
export type IncomeCategory = 'web_development' | 'maintenance' | 'hosting' | 'domain' | 'crm' | 'subscription' | 'other';
export type ProjectType = 'web_development' | 'app_development' | 'game_development' | 'ecommerce' | 'maintenance' | 'consulting' | 'design' | 'marketing' | 'seo' | 'hosting' | 'ai' | 'chatbot' | 'automation' | 'callcenter' | 'crm' | 'erp' | 'api_integration' | 'data_analytics' | 'cybersecurity' | 'cloud' | 'other';
export type ProjectStatus = 'active' | 'completed' | 'paused' | 'cancelled';
export type PaymentType = 'one_time' | 'monthly' | 'annual' | 'milestone';

export interface Client {
  id: string;
  user_id: string;
  name: string;
  company_name: string;
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
  start_date: string | null;
  end_date: string | null;
  payment_date: string | null;
  renewal_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientExpense {
  id: string;
  client_id: string;
  project_id?: string | null;
  service_name: string;
  description: string | null;
  amount: number;
  currency: Currency;
  frequency: Frequency;
  category: ClientExpenseCategory | null;
  status: PaymentStatus;
  start_date: string | null;
  end_date: string | null;
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

// Project Additions (modifications, extra services for a project)
export type ProjectAdditionStatus = 'pending' | 'paid';

export interface ProjectAddition {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  amount: number | null;
  currency: Currency;
  status: ProjectAdditionStatus;
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
  projects?: Project[];
  total_expenses_monthly?: number;
  total_expenses_annual?: number;
}

export interface ProjectWithClient extends Project {
  client?: Client;
  total_paid?: number;
  additions_total?: number;
  additions_paid?: number;
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

// Lead Types for Sales/Setter
// LeadStatus: Estado real del lead (qué tan vivo está)
export type LeadStatus = 'new' | 'contacted' | 'interested' | 'qualified' | 'not_qualified' | 'dormant';

// PipelineStage: Etapa comercial (solo para leads que entran al pipeline)
export type PipelineStage = 'none' | 'proposal' | 'negotiation' | 'demo' | 'closing' | 'won' | 'lost';

// LeadSource: Origen del lead (añadidos cold_email y reactivated)
export type LeadSource = 'website' | 'referral' | 'social_media' | 'cold_call' | 'cold_email' | 'email_campaign' | 'event' | 'advertising' | 'linkedin' | 'instagram' | 'facebook' | 'tiktok' | 'google_ads' | 'reactivated' | 'other';

// ServiceInterested: Servicios de interés (enum en lugar de texto libre)
export type ServiceInterested = 'call_center' | 'automations' | 'chatbot' | 'voicebot' | 'web_development' | 'app_development' | 'ai' | 'crm' | 'marketing' | 'seo' | 'other';

// PipelineType: Tipo de pipeline para clasificación automática
export type PipelineType = 'call_center' | 'automations' | 'chatbot' | 'voicebot' | 'general';

export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';
export type LeadTemperature = 'cold' | 'warm' | 'hot';

export interface Lead {
  id: string;
  user_id: string;
  assigned_to: string | null;
  // Contact Info
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  country: string | null;
  // Lead Details
  status: LeadStatus;
  pipeline_stage: PipelineStage;
  source: LeadSource;
  priority: LeadPriority;
  temperature: LeadTemperature;
  // Business Info
  estimated_value: number | null;
  currency: Currency;
  service_interested: ServiceInterested | null;
  pipeline_type: PipelineType;
  // Tracking
  first_contact_date: string | null;
  last_contact_date: string | null;
  next_followup_date: string | null;
  contact_count: number;
  // Notes
  notes: string | null;
  rejection_reason: string | null;
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  user_id: string;
  activity_type: 'call' | 'email' | 'whatsapp' | 'meeting' | 'note' | 'status_change';
  description: string;
  outcome: string | null;
  next_action: string | null;
  created_at: string;
}

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

// Activity Types for Setter Agenda
export type ActivityType = 'call' | 'email' | 'meeting' | 'follow_up' | 'reminder' | 'demo' | 'proposal' | 'other';
export type ActivityStatus = 'pending' | 'completed' | 'overdue' | 'cancelled' | 'rescheduled';
export type ActivityPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Activity {
  id: string;
  user_id: string;
  assigned_to: string | null;
  // Relations
  lead_id: string | null;
  company_name: string | null;
  // Details
  title: string;
  description: string | null;
  activity_type: ActivityType;
  // Schedule
  scheduled_date: string;
  scheduled_time: string | null;
  duration_minutes: number;
  // Status
  status: ActivityStatus;
  priority: ActivityPriority;
  // Result
  outcome: string | null;
  completed_at: string | null;
  // Automation
  auto_created: boolean;
  trigger_stage: PipelineStage | null;
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface ActivityWithLead extends Activity {
  lead?: Lead | null;
}

export interface PipelineAutomation {
  id: string;
  trigger_stage: PipelineStage;
  activity_type: ActivityType;
  activity_title: string;
  activity_description: string | null;
  days_delay: number;
  hours_delay: number;
  default_priority: ActivityPriority;
  is_active: boolean;
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
