-- Migration: Fix Lead Constraints for Professional System
-- This migration updates the CHECK constraints to match the new type definitions
-- Run AFTER 20241204_leads_professional_update.sql

-- =============================================
-- Step 1: Drop old CHECK constraints
-- =============================================

-- Drop old status constraint (was: 'new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'no_answer', 'callback')
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- Drop old source constraint (missing 'cold_email', 'reactivated')
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_source_check;

-- =============================================
-- Step 2: Add new CHECK constraints matching types.ts
-- =============================================

-- New status constraint: 'new' | 'contacted' | 'interested' | 'qualified' | 'not_qualified' | 'dormant'
ALTER TABLE leads ADD CONSTRAINT leads_status_check
  CHECK (status IN ('new', 'contacted', 'interested', 'qualified', 'not_qualified', 'dormant'));

-- New source constraint: includes 'cold_email' and 'reactivated'
ALTER TABLE leads ADD CONSTRAINT leads_source_check
  CHECK (source IN ('website', 'referral', 'social_media', 'cold_call', 'cold_email', 'email_campaign', 'event', 'advertising', 'linkedin', 'instagram', 'facebook', 'tiktok', 'google_ads', 'reactivated', 'other'));

-- Pipeline stage constraint
ALTER TABLE leads ADD CONSTRAINT leads_pipeline_stage_check
  CHECK (pipeline_stage IN ('none', 'proposal', 'negotiation', 'demo', 'closing', 'won', 'lost'));

-- Pipeline type constraint
ALTER TABLE leads ADD CONSTRAINT leads_pipeline_type_check
  CHECK (pipeline_type IN ('call_center', 'automations', 'chatbot', 'voicebot', 'general'));

-- Service interested constraint (can be NULL)
ALTER TABLE leads ADD CONSTRAINT leads_service_interested_check
  CHECK (service_interested IS NULL OR service_interested IN ('call_center', 'automations', 'chatbot', 'voicebot', 'web_development', 'app_development', 'ai', 'crm', 'marketing', 'seo', 'other'));

-- =============================================
-- Step 3: Update any remaining invalid data
-- =============================================

-- Fix any status values that don't match the new constraint
UPDATE leads SET status = 'dormant' WHERE status NOT IN ('new', 'contacted', 'interested', 'qualified', 'not_qualified', 'dormant');

-- Fix any source values that don't match the new constraint
UPDATE leads SET source = 'other' WHERE source NOT IN ('website', 'referral', 'social_media', 'cold_call', 'cold_email', 'email_campaign', 'event', 'advertising', 'linkedin', 'instagram', 'facebook', 'tiktok', 'google_ads', 'reactivated', 'other');

-- Fix any pipeline_stage values
UPDATE leads SET pipeline_stage = 'none' WHERE pipeline_stage IS NULL OR pipeline_stage NOT IN ('none', 'proposal', 'negotiation', 'demo', 'closing', 'won', 'lost');

-- Fix any pipeline_type values
UPDATE leads SET pipeline_type = 'general' WHERE pipeline_type IS NULL OR pipeline_type NOT IN ('call_center', 'automations', 'chatbot', 'voicebot', 'general');

-- =============================================
-- Step 4: Set NOT NULL with defaults for required fields
-- =============================================

-- Ensure pipeline_stage has a default
ALTER TABLE leads ALTER COLUMN pipeline_stage SET DEFAULT 'none';
ALTER TABLE leads ALTER COLUMN pipeline_stage SET NOT NULL;

-- Ensure pipeline_type has a default
ALTER TABLE leads ALTER COLUMN pipeline_type SET DEFAULT 'general';
ALTER TABLE leads ALTER COLUMN pipeline_type SET NOT NULL;

-- =============================================
-- Step 5: Update comments
-- =============================================

COMMENT ON TABLE leads IS 'Leads/prospectos para ventas. Status = estado del lead (vivo/muerto), pipeline_stage = etapa comercial (ventas)';
COMMENT ON COLUMN leads.status IS 'Estado del lead: new (nuevo), contacted (contactado), interested (interesado), qualified (calificado), not_qualified (no calificado), dormant (dormido)';
COMMENT ON COLUMN leads.pipeline_stage IS 'Etapa del pipeline comercial: none (sin pipeline), proposal (propuesta), demo (demo), negotiation (negociacion), closing (cierre), won (ganado), lost (perdido)';
COMMENT ON COLUMN leads.source IS 'Origen del lead: website, referral, social_media, cold_call, cold_email, email_campaign, event, advertising, linkedin, instagram, facebook, tiktok, google_ads, reactivated, other';
COMMENT ON COLUMN leads.pipeline_type IS 'Tipo de pipeline para clasificacion: call_center, automations, chatbot, voicebot, general';
COMMENT ON COLUMN leads.service_interested IS 'Servicio de interes: call_center, automations, chatbot, voicebot, web_development, app_development, ai, crm, marketing, seo, other';
