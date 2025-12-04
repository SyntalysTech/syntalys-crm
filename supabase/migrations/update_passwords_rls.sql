-- SQL para actualizar las políticas RLS de la tabla passwords
-- Ejecutar en Supabase SQL Editor (https://supabase.com/dashboard -> SQL Editor)

-- 1. Primero, eliminar las políticas existentes de la tabla passwords
DROP POLICY IF EXISTS "Users can view their own passwords" ON passwords;
DROP POLICY IF EXISTS "Users can insert their own passwords" ON passwords;
DROP POLICY IF EXISTS "Users can update their own passwords" ON passwords;
DROP POLICY IF EXISTS "Users can delete their own passwords" ON passwords;
DROP POLICY IF EXISTS "passwords_select_policy" ON passwords;
DROP POLICY IF EXISTS "passwords_insert_policy" ON passwords;
DROP POLICY IF EXISTS "passwords_update_policy" ON passwords;
DROP POLICY IF EXISTS "passwords_delete_policy" ON passwords;

-- 2. Crear función auxiliar para verificar si el usuario es super_admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear función para obtener todos los IDs de super_admins
CREATE OR REPLACE FUNCTION get_super_admin_ids()
RETURNS SETOF uuid AS $$
BEGIN
  RETURN QUERY SELECT id FROM profiles WHERE role = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Crear nuevas políticas RLS para passwords

-- SELECT: Super admins pueden ver contraseñas de todos los super_admins
-- Otros usuarios solo pueden ver sus propias contraseñas
CREATE POLICY "passwords_select_policy" ON passwords
FOR SELECT USING (
  CASE
    WHEN is_super_admin(auth.uid()) THEN
      user_id IN (SELECT get_super_admin_ids())
    ELSE
      user_id = auth.uid()
  END
);

-- INSERT: Cualquier usuario autenticado puede insertar sus propias contraseñas
CREATE POLICY "passwords_insert_policy" ON passwords
FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- UPDATE: Super admins pueden actualizar contraseñas de cualquier super_admin
-- Otros usuarios solo pueden actualizar sus propias contraseñas
CREATE POLICY "passwords_update_policy" ON passwords
FOR UPDATE USING (
  CASE
    WHEN is_super_admin(auth.uid()) THEN
      user_id IN (SELECT get_super_admin_ids())
    ELSE
      user_id = auth.uid()
  END
);

-- DELETE: Super admins pueden eliminar contraseñas de cualquier super_admin
-- Otros usuarios solo pueden eliminar sus propias contraseñas
CREATE POLICY "passwords_delete_policy" ON passwords
FOR DELETE USING (
  CASE
    WHEN is_super_admin(auth.uid()) THEN
      user_id IN (SELECT get_super_admin_ids())
    ELSE
      user_id = auth.uid()
  END
);

-- 5. Asegurarse de que RLS está habilitado
ALTER TABLE passwords ENABLE ROW LEVEL SECURITY;
