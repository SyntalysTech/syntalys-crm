-- Add start_date and end_date columns to company_expenses and client_expenses
ALTER TABLE company_expenses ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE company_expenses ADD COLUMN IF NOT EXISTS end_date DATE;

ALTER TABLE client_expenses ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE client_expenses ADD COLUMN IF NOT EXISTS end_date DATE;

-- Add comments
COMMENT ON COLUMN company_expenses.start_date IS 'Date when the subscription or service started';
COMMENT ON COLUMN company_expenses.end_date IS 'Date when the subscription or service ended (if cancelled)';
COMMENT ON COLUMN client_expenses.start_date IS 'Date when the subscription or service started';
COMMENT ON COLUMN client_expenses.end_date IS 'Date when the subscription or service ended (if cancelled)';
