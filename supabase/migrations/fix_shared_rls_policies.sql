-- =====================================================
-- FIX RLS POLICIES FOR SHARED CRM DATA
-- =====================================================
-- Este script arregla las políticas RLS para que TODOS los usuarios
-- autenticados puedan ver y gestionar los mismos datos del CRM.
--
-- Tablas afectadas: clients, projects, company_expenses, client_expenses, client_income
--
-- IMPORTANTE: Ejecutar este script en Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CLIENTS TABLE - Datos compartidos por todos
-- =====================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;
DROP POLICY IF EXISTS "clients_select_policy" ON clients;
DROP POLICY IF EXISTS "clients_insert_policy" ON clients;
DROP POLICY IF EXISTS "clients_update_policy" ON clients;
DROP POLICY IF EXISTS "clients_delete_policy" ON clients;
DROP POLICY IF EXISTS "Authenticated users can view all clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can update clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can delete clients" ON clients;

-- Crear nuevas políticas: Todos los usuarios autenticados comparten los datos
CREATE POLICY "Authenticated users can view all clients" ON clients
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert clients" ON clients
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update clients" ON clients
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete clients" ON clients
FOR DELETE USING (auth.role() = 'authenticated');

-- Asegurar que RLS está habilitado
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. PROJECTS TABLE - Datos compartidos por todos
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
DROP POLICY IF EXISTS "projects_select_policy" ON projects;
DROP POLICY IF EXISTS "projects_insert_policy" ON projects;
DROP POLICY IF EXISTS "projects_update_policy" ON projects;
DROP POLICY IF EXISTS "projects_delete_policy" ON projects;
DROP POLICY IF EXISTS "Authenticated users can view all projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON projects;

CREATE POLICY "Authenticated users can view all projects" ON projects
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert projects" ON projects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update projects" ON projects
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete projects" ON projects
FOR DELETE USING (auth.role() = 'authenticated');

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. COMPANY_EXPENSES TABLE - Datos compartidos por todos
-- =====================================================

DROP POLICY IF EXISTS "Users can view company expenses" ON company_expenses;
DROP POLICY IF EXISTS "Users can insert company expenses" ON company_expenses;
DROP POLICY IF EXISTS "Users can update company expenses" ON company_expenses;
DROP POLICY IF EXISTS "Users can delete company expenses" ON company_expenses;
DROP POLICY IF EXISTS "company_expenses_select_policy" ON company_expenses;
DROP POLICY IF EXISTS "company_expenses_insert_policy" ON company_expenses;
DROP POLICY IF EXISTS "company_expenses_update_policy" ON company_expenses;
DROP POLICY IF EXISTS "company_expenses_delete_policy" ON company_expenses;
DROP POLICY IF EXISTS "Authenticated users can view all company_expenses" ON company_expenses;
DROP POLICY IF EXISTS "Authenticated users can insert company_expenses" ON company_expenses;
DROP POLICY IF EXISTS "Authenticated users can update company_expenses" ON company_expenses;
DROP POLICY IF EXISTS "Authenticated users can delete company_expenses" ON company_expenses;

CREATE POLICY "Authenticated users can view all company_expenses" ON company_expenses
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert company_expenses" ON company_expenses
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update company_expenses" ON company_expenses
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete company_expenses" ON company_expenses
FOR DELETE USING (auth.role() = 'authenticated');

ALTER TABLE company_expenses ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CLIENT_EXPENSES TABLE - Datos compartidos por todos
-- =====================================================

DROP POLICY IF EXISTS "Users can view client expenses" ON client_expenses;
DROP POLICY IF EXISTS "Users can insert client expenses" ON client_expenses;
DROP POLICY IF EXISTS "Users can update client expenses" ON client_expenses;
DROP POLICY IF EXISTS "Users can delete client expenses" ON client_expenses;
DROP POLICY IF EXISTS "client_expenses_select_policy" ON client_expenses;
DROP POLICY IF EXISTS "client_expenses_insert_policy" ON client_expenses;
DROP POLICY IF EXISTS "client_expenses_update_policy" ON client_expenses;
DROP POLICY IF EXISTS "client_expenses_delete_policy" ON client_expenses;
DROP POLICY IF EXISTS "Authenticated users can view all client_expenses" ON client_expenses;
DROP POLICY IF EXISTS "Authenticated users can insert client_expenses" ON client_expenses;
DROP POLICY IF EXISTS "Authenticated users can update client_expenses" ON client_expenses;
DROP POLICY IF EXISTS "Authenticated users can delete client_expenses" ON client_expenses;

CREATE POLICY "Authenticated users can view all client_expenses" ON client_expenses
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert client_expenses" ON client_expenses
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update client_expenses" ON client_expenses
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete client_expenses" ON client_expenses
FOR DELETE USING (auth.role() = 'authenticated');

ALTER TABLE client_expenses ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CLIENT_INCOME TABLE - Datos compartidos por todos
-- =====================================================

DROP POLICY IF EXISTS "Users can view client income" ON client_income;
DROP POLICY IF EXISTS "Users can insert client income" ON client_income;
DROP POLICY IF EXISTS "Users can update client income" ON client_income;
DROP POLICY IF EXISTS "Users can delete client income" ON client_income;
DROP POLICY IF EXISTS "client_income_select_policy" ON client_income;
DROP POLICY IF EXISTS "client_income_insert_policy" ON client_income;
DROP POLICY IF EXISTS "client_income_update_policy" ON client_income;
DROP POLICY IF EXISTS "client_income_delete_policy" ON client_income;
DROP POLICY IF EXISTS "Authenticated users can view all client_income" ON client_income;
DROP POLICY IF EXISTS "Authenticated users can insert client_income" ON client_income;
DROP POLICY IF EXISTS "Authenticated users can update client_income" ON client_income;
DROP POLICY IF EXISTS "Authenticated users can delete client_income" ON client_income;

CREATE POLICY "Authenticated users can view all client_income" ON client_income
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert client_income" ON client_income
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update client_income" ON client_income
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete client_income" ON client_income
FOR DELETE USING (auth.role() = 'authenticated');

ALTER TABLE client_income ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. INTERNAL_PROJECTS TABLE - Ya tiene políticas correctas
--    (solo super_admin y admin pueden ver/gestionar)
-- =====================================================
-- No se modifica, ya está configurado correctamente

-- =====================================================
-- 7. PROFILES TABLE - Asegurar que usuarios pueden ver perfiles
-- =====================================================

DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can update own profile" ON profiles;

CREATE POLICY "Authenticated users can view all profiles" ON profiles
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICACION
-- =====================================================
-- Ejecuta esta consulta para verificar las políticas:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public';
