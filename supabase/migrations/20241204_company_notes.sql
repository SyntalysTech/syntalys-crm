-- Company Notes table for storing notes at company/account level
-- These notes are aggregated from leads that share the same company_name

CREATE TABLE IF NOT EXISTS company_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL UNIQUE,
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups by company name
CREATE INDEX IF NOT EXISTS idx_company_notes_company_name ON company_notes(company_name);

-- Enable RLS
ALTER TABLE company_notes ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read, insert, and update company notes
CREATE POLICY "Allow authenticated read company_notes" ON company_notes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert company_notes" ON company_notes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update company_notes" ON company_notes
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete company_notes" ON company_notes
  FOR DELETE TO authenticated USING (true);
