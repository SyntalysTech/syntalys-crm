-- Add professional email and website fields to projects table
-- Run this migration in Supabase SQL Editor

-- Add has_professional_email column (boolean, default false)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS has_professional_email BOOLEAN DEFAULT false;

-- Add professional_email column (text, nullable)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS professional_email TEXT;

-- Add has_website column (boolean, default false)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS has_website BOOLEAN DEFAULT false;

-- Add website_url column (text, nullable)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Update existing rows to have default values
UPDATE projects
SET has_professional_email = false
WHERE has_professional_email IS NULL;

UPDATE projects
SET has_website = false
WHERE has_website IS NULL;
