-- Update project_type constraint to include new categories
-- Run this in Supabase SQL Editor

-- First, drop the existing constraint on projects table (if exists)
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_project_type_check;

-- Add the new constraint with all project types
ALTER TABLE projects ADD CONSTRAINT projects_project_type_check
  CHECK (project_type IS NULL OR project_type IN (
    'web_development',
    'app_development',
    'game_development',
    'ecommerce',
    'maintenance',
    'consulting',
    'design',
    'marketing',
    'seo',
    'hosting',
    'other'
  ));

-- Also update internal_projects table constraint (if needed)
ALTER TABLE internal_projects DROP CONSTRAINT IF EXISTS internal_projects_project_type_check;

ALTER TABLE internal_projects ADD CONSTRAINT internal_projects_project_type_check
  CHECK (project_type IS NULL OR project_type IN (
    'web_development',
    'app_development',
    'game_development',
    'ecommerce',
    'maintenance',
    'consulting',
    'design',
    'marketing',
    'seo',
    'hosting',
    'other'
  ));
