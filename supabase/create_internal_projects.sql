-- Create internal_projects table for Syntalys Lab projects
CREATE TABLE IF NOT EXISTS internal_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'in_progress', 'completed', 'on_hold', 'cancelled')),
    project_type VARCHAR(50) CHECK (project_type IN ('web_development', 'app_development', 'maintenance', 'consulting', 'design', 'hosting', 'other')),
    start_date DATE,
    target_date DATE,
    repository_url TEXT,
    demo_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_internal_projects_status ON internal_projects(status);
CREATE INDEX IF NOT EXISTS idx_internal_projects_created_at ON internal_projects(created_at DESC);

-- Enable RLS
ALTER TABLE internal_projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Super admins and admins can view internal projects" ON internal_projects;
DROP POLICY IF EXISTS "Super admins and admins can create internal projects" ON internal_projects;
DROP POLICY IF EXISTS "Super admins and admins can update internal projects" ON internal_projects;
DROP POLICY IF EXISTS "Super admins and admins can delete internal projects" ON internal_projects;

-- RLS Policies: Only super_admin and admin can manage internal projects
CREATE POLICY "Super admins and admins can view internal projects"
    ON internal_projects FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "Super admins and admins can create internal projects"
    ON internal_projects FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "Super admins and admins can update internal projects"
    ON internal_projects FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "Super admins and admins can delete internal projects"
    ON internal_projects FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin')
        )
    );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_internal_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_internal_projects_updated_at ON internal_projects;
CREATE TRIGGER trigger_internal_projects_updated_at
    BEFORE UPDATE ON internal_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_internal_projects_updated_at();
