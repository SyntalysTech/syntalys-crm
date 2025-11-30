import { supabase } from './supabase';
import type { Profile } from './types';

// Registrar nuevo usuario
export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw error;
  return data;
}

// Iniciar sesión
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// Cerrar sesión
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Obtener usuario actual
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// Obtener perfil del usuario actual
export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
}

// Verificar si el usuario tiene un rol específico
export async function hasRole(role: string): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.role === role;
}

// Verificar si es super admin
export async function isSuperAdmin(): Promise<boolean> {
  return hasRole('super_admin');
}

// Verificar si es admin o superior
export async function isAdminOrAbove(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.role === 'super_admin' || profile?.role === 'admin';
}
