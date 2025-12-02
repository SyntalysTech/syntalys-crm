-- Create project_additions table for modifications and extra services
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS project_additions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'CHF' CHECK (currency IN ('CHF', 'EUR', 'USD')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_additions_project_id ON project_additions(project_id);

-- Enable RLS
ALTER TABLE project_additions ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for authenticated users)
CREATE POLICY "Enable read access for all users" ON project_additions
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON project_additions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON project_additions
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON project_additions
  FOR DELETE USING (true);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_project_additions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_additions_updated_at
  BEFORE UPDATE ON project_additions
  FOR EACH ROW
  EXECUTE FUNCTION update_project_additions_updated_at();
