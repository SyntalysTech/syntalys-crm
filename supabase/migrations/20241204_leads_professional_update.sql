-- Migration: Professional Lead Management System Update
-- This migration updates the leads table to support:
-- 1. Separate lead status (how alive is the lead) from pipeline stage (sales stage)
-- 2. Typed service_interested field (enum instead of free text)
-- 3. Pipeline type for automatic classification
-- 4. New source options (cold_email, reactivated)

-- Step 1: Add new columns
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS pipeline_stage TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS pipeline_type TEXT DEFAULT 'general';

-- Step 2: Migrate existing status data to the new structure
-- Map old statuses to new status + pipeline_stage

-- First, update pipeline_stage based on current status for leads in sales stages
UPDATE leads SET pipeline_stage = 'proposal' WHERE status = 'proposal';
UPDATE leads SET pipeline_stage = 'negotiation' WHERE status = 'negotiation';
UPDATE leads SET pipeline_stage = 'won' WHERE status = 'won';
UPDATE leads SET pipeline_stage = 'lost' WHERE status = 'lost';

-- Then map old status to new status
-- 'new' stays 'new'
-- 'contacted' stays 'contacted'
-- 'qualified' stays 'qualified'
-- 'proposal' -> 'qualified' (they were qualified to get a proposal)
-- 'negotiation' -> 'qualified'
-- 'won' -> 'qualified'
-- 'lost' -> 'not_qualified' or 'qualified' depending on rejection
-- 'no_answer' -> 'dormant'
-- 'callback' -> 'contacted'

UPDATE leads SET status = 'qualified' WHERE status IN ('proposal', 'negotiation', 'won');
UPDATE leads SET status = 'dormant' WHERE status = 'no_answer';
UPDATE leads SET status = 'contacted' WHERE status = 'callback';
UPDATE leads SET status = 'not_qualified' WHERE status = 'lost' AND rejection_reason IS NOT NULL;
UPDATE leads SET status = 'qualified' WHERE status = 'lost' AND rejection_reason IS NULL;

-- Step 3: Set pipeline_type based on service_interested (auto-classification)
-- This maps the old free-text service_interested to the new pipeline_type
UPDATE leads SET pipeline_type = 'call_center' WHERE LOWER(service_interested) LIKE '%call%center%' OR LOWER(service_interested) LIKE '%callcenter%';
UPDATE leads SET pipeline_type = 'automations' WHERE LOWER(service_interested) LIKE '%autom%';
UPDATE leads SET pipeline_type = 'chatbot' WHERE LOWER(service_interested) LIKE '%chatbot%' OR LOWER(service_interested) LIKE '%chat%bot%';
UPDATE leads SET pipeline_type = 'voicebot' WHERE LOWER(service_interested) LIKE '%voice%bot%' OR LOWER(service_interested) LIKE '%voicebot%';

-- Step 4: Map old free-text service_interested to new enum values
-- We'll try to match common patterns
UPDATE leads SET service_interested = 'call_center' WHERE LOWER(service_interested) LIKE '%call%center%' OR LOWER(service_interested) LIKE '%callcenter%';
UPDATE leads SET service_interested = 'automations' WHERE LOWER(service_interested) LIKE '%autom%' AND service_interested != 'call_center';
UPDATE leads SET service_interested = 'chatbot' WHERE LOWER(service_interested) LIKE '%chatbot%' OR LOWER(service_interested) LIKE '%chat%bot%';
UPDATE leads SET service_interested = 'voicebot' WHERE LOWER(service_interested) LIKE '%voice%bot%' OR LOWER(service_interested) LIKE '%voicebot%';
UPDATE leads SET service_interested = 'web_development' WHERE LOWER(service_interested) LIKE '%web%' OR LOWER(service_interested) LIKE '%página%' OR LOWER(service_interested) LIKE '%sitio%';
UPDATE leads SET service_interested = 'app_development' WHERE LOWER(service_interested) LIKE '%app%' OR LOWER(service_interested) LIKE '%aplicación%';
UPDATE leads SET service_interested = 'ai' WHERE LOWER(service_interested) LIKE '%ia%' OR LOWER(service_interested) LIKE '%inteligencia%' OR LOWER(service_interested) LIKE '%artificial%';
UPDATE leads SET service_interested = 'crm' WHERE LOWER(service_interested) LIKE '%crm%';
UPDATE leads SET service_interested = 'marketing' WHERE LOWER(service_interested) LIKE '%market%';
UPDATE leads SET service_interested = 'seo' WHERE LOWER(service_interested) LIKE '%seo%' OR LOWER(service_interested) LIKE '%posicion%';
-- Set remaining unmatched values to 'other'
UPDATE leads SET service_interested = 'other' WHERE service_interested IS NOT NULL
  AND service_interested NOT IN ('call_center', 'automations', 'chatbot', 'voicebot', 'web_development', 'app_development', 'ai', 'crm', 'marketing', 'seo', 'other');

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_pipeline_stage ON leads(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_leads_pipeline_type ON leads(pipeline_type);
CREATE INDEX IF NOT EXISTS idx_leads_service_interested ON leads(service_interested);
CREATE INDEX IF NOT EXISTS idx_leads_company_name ON leads(company_name);

-- Step 6: Add comments for documentation
COMMENT ON COLUMN leads.status IS 'Estado del lead: new, contacted, interested, qualified, not_qualified, dormant';
COMMENT ON COLUMN leads.pipeline_stage IS 'Etapa del pipeline: none, proposal, negotiation, demo, closing, won, lost';
COMMENT ON COLUMN leads.pipeline_type IS 'Tipo de pipeline: call_center, automations, chatbot, voicebot, general';
COMMENT ON COLUMN leads.service_interested IS 'Servicio de interés: call_center, automations, chatbot, voicebot, web_development, app_development, ai, crm, marketing, seo, other';
