-- Add country field to clients table
-- Run this migration in Supabase SQL Editor

-- Add country column (text, nullable)
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS country TEXT;

-- Optional: Update existing clients to have NULL country
-- (They already will be NULL by default, this is just for clarity)
UPDATE clients
SET country = NULL
WHERE country IS NULL;
