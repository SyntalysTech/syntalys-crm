-- Add custom_project_type column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS custom_project_type TEXT;

-- Create project_milestones table for milestone/hito payments
CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'CHF' CHECK (currency IN ('CHF', 'EUR', 'USD')),
  due_date DATE,
  paid_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial')),
  paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_status ON project_milestones(status);

-- Enable RLS on project_milestones
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project_milestones (shared access like projects)
CREATE POLICY "project_milestones_select_policy" ON project_milestones
  FOR SELECT USING (true);

CREATE POLICY "project_milestones_insert_policy" ON project_milestones
  FOR INSERT WITH CHECK (true);

CREATE POLICY "project_milestones_update_policy" ON project_milestones
  FOR UPDATE USING (true);

CREATE POLICY "project_milestones_delete_policy" ON project_milestones
  FOR DELETE USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_project_milestones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS project_milestones_updated_at ON project_milestones;
CREATE TRIGGER project_milestones_updated_at
  BEFORE UPDATE ON project_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_project_milestones_updated_at();
