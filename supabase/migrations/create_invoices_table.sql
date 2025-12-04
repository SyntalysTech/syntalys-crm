-- =====================================================
-- CREATE INVOICES TABLE
-- =====================================================
-- Run this migration in Supabase SQL Editor
-- This creates the invoices table for storing client invoices

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    invoice_number TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'CHF',
    issue_date DATE NOT NULL,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    file_url TEXT,
    file_name TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (shared access for all authenticated users)
DROP POLICY IF EXISTS "Authenticated users can view all invoices" ON invoices;
DROP POLICY IF EXISTS "Authenticated users can insert invoices" ON invoices;
DROP POLICY IF EXISTS "Authenticated users can update invoices" ON invoices;
DROP POLICY IF EXISTS "Authenticated users can delete invoices" ON invoices;

CREATE POLICY "Authenticated users can view all invoices" ON invoices
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert invoices" ON invoices
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update invoices" ON invoices
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete invoices" ON invoices
FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- CREATE STORAGE BUCKET FOR INVOICES
-- =====================================================
-- Note: You need to create the storage bucket manually in Supabase Dashboard
-- Go to Storage > New Bucket > Name: "invoices" > Public: Yes

-- Or run this in SQL if you have permissions:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('invoices', 'invoices', true);

-- Storage policies for the invoices bucket
-- These need to be created in the Supabase Dashboard > Storage > Policies
-- Or you can run them if you have permissions:

-- Allow authenticated users to upload files
-- CREATE POLICY "Authenticated users can upload invoices"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'invoices' AND auth.role() = 'authenticated');

-- Allow authenticated users to view files
-- CREATE POLICY "Authenticated users can view invoices"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'invoices' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their files
-- CREATE POLICY "Authenticated users can delete invoices"
-- ON storage.objects FOR DELETE
-- USING (bucket_id = 'invoices' AND auth.role() = 'authenticated');
