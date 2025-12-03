-- Add project_id column to client_expenses table
ALTER TABLE client_expenses ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_client_expenses_project_id ON client_expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_client_expenses_client_id ON client_expenses(client_id);

-- Add comment to explain the column
COMMENT ON COLUMN client_expenses.project_id IS 'Optional reference to a specific project. When set, this expense belongs to that project instead of being a general client expense.';
