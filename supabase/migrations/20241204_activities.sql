-- =============================================
-- ACTIVITIES TABLE - Agenda del Setter
-- =============================================

-- Crear tabla de actividades
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Relacionado con Lead/Empresa
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  company_name VARCHAR(255),

  -- Detalles de la actividad
  title VARCHAR(255) NOT NULL,
  description TEXT,
  activity_type VARCHAR(30) NOT NULL DEFAULT 'call'
    CHECK (activity_type IN ('call', 'email', 'meeting', 'follow_up', 'reminder', 'demo', 'proposal', 'other')),

  -- Fecha y hora
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  duration_minutes INTEGER DEFAULT 30,

  -- Estado y prioridad
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'overdue', 'cancelled', 'rescheduled')),
  priority VARCHAR(10) NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  -- Resultado (cuando se completa)
  outcome TEXT,
  completed_at TIMESTAMPTZ,

  -- Automatización
  auto_created BOOLEAN DEFAULT FALSE,
  trigger_stage VARCHAR(30), -- etapa del pipeline que creó esta actividad

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_assigned_to ON activities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_scheduled_date ON activities(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_activity_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_priority ON activities(priority);
CREATE INDEX IF NOT EXISTS idx_activities_company_name ON activities(company_name);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_activities_updated_at ON activities;
CREATE TRIGGER trigger_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_activities_updated_at();

-- Trigger para marcar actividades como vencidas automáticamente
CREATE OR REPLACE FUNCTION mark_overdue_activities()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la fecha programada ya pasó y el estado sigue pendiente, marcar como vencida
  IF NEW.scheduled_date < CURRENT_DATE AND NEW.status = 'pending' THEN
    NEW.status = 'overdue';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_mark_overdue ON activities;
CREATE TRIGGER trigger_mark_overdue
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION mark_overdue_activities();

-- Habilitar RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own activities" ON activities
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can insert own activities" ON activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities" ON activities
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can delete own activities" ON activities
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- PIPELINE AUTOMATION RULES
-- =============================================

CREATE TABLE IF NOT EXISTS pipeline_automations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Trigger
  trigger_stage VARCHAR(30) NOT NULL, -- etapa que dispara la automatización

  -- Acción
  activity_type VARCHAR(30) NOT NULL,
  activity_title VARCHAR(255) NOT NULL,
  activity_description TEXT,
  days_delay INTEGER DEFAULT 0, -- días después del cambio de etapa
  hours_delay INTEGER DEFAULT 0, -- horas después
  default_priority VARCHAR(10) DEFAULT 'medium',

  -- Config
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar automatizaciones por defecto
INSERT INTO pipeline_automations (trigger_stage, activity_type, activity_title, activity_description, days_delay, default_priority) VALUES
  ('proposal', 'follow_up', 'Seguimiento de propuesta', 'Contactar para revisar propuesta enviada', 2, 'high'),
  ('demo', 'reminder', 'Preparar demo', 'Preparar materiales y ambiente para la demo', 0, 'urgent'),
  ('demo', 'follow_up', 'Follow-up post-demo', 'Contactar después de la demo para resolver dudas', 1, 'high'),
  ('negotiation', 'call', 'Llamada de negociación', 'Discutir términos y resolver objeciones', 1, 'high'),
  ('closing', 'meeting', 'Reunión de cierre', 'Presentar contrato y cerrar venta', 0, 'urgent'),
  ('won', 'email', 'Email de bienvenida', 'Enviar email de bienvenida y próximos pasos', 0, 'medium')
ON CONFLICT DO NOTHING;

-- RLS para automations
ALTER TABLE pipeline_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read pipeline_automations" ON pipeline_automations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow super_admin manage pipeline_automations" ON pipeline_automations
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Comentarios
COMMENT ON TABLE activities IS 'Actividades/tareas programadas para seguimiento de leads';
COMMENT ON TABLE pipeline_automations IS 'Reglas de automatización que crean actividades cuando un lead cambia de etapa';
COMMENT ON COLUMN activities.auto_created IS 'True si la actividad fue creada automáticamente por una regla de pipeline';
COMMENT ON COLUMN activities.trigger_stage IS 'Etapa del pipeline que disparó la creación automática de esta actividad';
