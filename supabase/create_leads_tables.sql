-- =============================================
-- LEADS TABLE - Para gestión de ventas (Setter)
-- =============================================

-- Crear tabla de leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Contact Info
  name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  whatsapp VARCHAR(50),
  country VARCHAR(10),

  -- Lead Details
  status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'no_answer', 'callback')),
  source VARCHAR(30) NOT NULL DEFAULT 'website' CHECK (source IN ('website', 'referral', 'social_media', 'cold_call', 'email_campaign', 'event', 'advertising', 'linkedin', 'instagram', 'facebook', 'tiktok', 'google_ads', 'other')),
  priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  temperature VARCHAR(10) NOT NULL DEFAULT 'warm' CHECK (temperature IN ('cold', 'warm', 'hot')),

  -- Business Info
  estimated_value DECIMAL(15, 2),
  currency VARCHAR(3) DEFAULT 'CHF' CHECK (currency IN ('CHF', 'EUR', 'USD')),
  service_interested VARCHAR(255),

  -- Tracking
  first_contact_date DATE,
  last_contact_date DATE,
  next_followup_date DATE,
  contact_count INTEGER DEFAULT 0,

  -- Notes
  notes TEXT,
  rejection_reason TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de actividades de leads
CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  activity_type VARCHAR(20) NOT NULL CHECK (activity_type IN ('call', 'email', 'whatsapp', 'meeting', 'note', 'status_change')),
  description TEXT NOT NULL,
  outcome TEXT,
  next_action TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_temperature ON leads(temperature);
CREATE INDEX IF NOT EXISTS idx_leads_next_followup ON leads(next_followup_date);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created_at ON lead_activities(created_at);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_leads_updated_at ON leads;
CREATE TRIGGER trigger_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at();

-- Habilitar Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para leads (usuarios pueden ver/editar sus propios leads o los asignados a ellos)
CREATE POLICY "Users can view own leads" ON leads
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can insert own leads" ON leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads" ON leads
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can delete own leads" ON leads
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para actividades de leads
CREATE POLICY "Users can view activities of accessible leads" ON lead_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_activities.lead_id
      AND (leads.user_id = auth.uid() OR leads.assigned_to = auth.uid())
    )
  );

CREATE POLICY "Users can insert activities for accessible leads" ON lead_activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_activities.lead_id
      AND (leads.user_id = auth.uid() OR leads.assigned_to = auth.uid())
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE leads IS 'Tabla principal de leads/prospectos para el módulo de ventas';
COMMENT ON TABLE lead_activities IS 'Historial de actividades realizadas con cada lead';
COMMENT ON COLUMN leads.status IS 'Estado del lead: new, contacted, qualified, proposal, negotiation, won, lost, no_answer, callback';
COMMENT ON COLUMN leads.source IS 'Fuente de donde proviene el lead';
COMMENT ON COLUMN leads.priority IS 'Prioridad del lead: low, medium, high, urgent';
COMMENT ON COLUMN leads.temperature IS 'Temperatura del lead: cold (frío), warm (tibio), hot (caliente)';
COMMENT ON COLUMN leads.contact_count IS 'Número de veces que se ha contactado al lead';
