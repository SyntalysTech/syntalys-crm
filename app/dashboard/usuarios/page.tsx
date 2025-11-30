'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

export default function UsuariosPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    role: 'empleado' as UserRole,
    password: '',
    active: true,
  });

  // Verificar que el usuario sea super_admin
  useEffect(() => {
    if (!authLoading && profile?.role !== 'super_admin') {
      router.push('/dashboard');
    }
  }, [profile, authLoading, router]);

  useEffect(() => {
    if (profile?.role === 'super_admin') {
      loadUsers();
    }
  }, [profile]);

  async function loadUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      alert(t.messages.loadError);
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingUser(null);
    setFormData({
      email: '',
      full_name: '',
      phone: '',
      role: 'empleado',
      password: '',
      active: true,
    });
    setShowModal(true);
  }

  function openEditModal(user: Profile) {
    setEditingUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name || '',
      phone: user.phone || '',
      role: user.role,
      password: '',
      active: user.active,
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.email || !formData.full_name) {
      alert(t.messages.fillRequired);
      return;
    }

    if (!editingUser && !formData.password) {
      alert('La contraseña es obligatoria para nuevos usuarios');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      if (editingUser) {
        // Editar usuario existente
        const updateData: any = {
          full_name: formData.full_name,
          phone: formData.phone || null,
          role: formData.role,
          active: formData.active,
        };

        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', editingUser.id);

        if (error) throw error;

        // Si se proporcionó una nueva contraseña, actualizarla
        if (formData.password) {
          // Nota: Actualizar contraseña requiere permisos especiales en Supabase
          // Esto debería hacerse a través de una función Edge o Admin API
          console.log('Actualización de contraseña pendiente de implementar');
        }

        alert(t.messages.saveSuccess);
      } else {
        // Crear nuevo usuario
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
              phone: formData.phone || null,
              role: formData.role,
            },
          },
        });

        if (authError) throw authError;

        if (authData.user) {
          // Actualizar el perfil
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              full_name: formData.full_name,
              phone: formData.phone || null,
              role: formData.role,
              active: formData.active,
            })
            .eq('id', authData.user.id);

          if (profileError) throw profileError;
        }

        alert(t.messages.saveSuccess);
      }

      setShowModal(false);
      loadUsers();
    } catch (error: any) {
      console.error('Error saving user:', error);
      alert(error.message || t.messages.saveError);
    }
  }

  async function handleDelete(userId: string, userName: string) {
    if (!confirm(`${t.messages.deleteConfirm} "${userName}"?`)) {
      return;
    }

    try {
      // Nota: Eliminar usuarios requiere permisos especiales
      // En producción, esto debería hacerse a través de Admin API
      const { error } = await supabase
        .from('profiles')
        .update({ active: false })
        .eq('id', userId);

      if (error) throw error;

      alert('Usuario desactivado correctamente');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(t.messages.deleteError);
    }
  }

  function getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      super_admin: t.users.superAdmin,
      admin: t.users.admin,
      gestor: t.users.manager,
      empleado: t.users.employee,
    };
    return labels[role] || role;
  }

  const activeUsers = users.filter(u => u.active).length;
  const inactiveUsers = users.filter(u => !u.active).length;

  if (authLoading || loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">{t.common.loading}...</p>
        </div>
      </div>
    );
  }

  if (profile?.role !== 'super_admin') {
    return null;
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.users.title}</h1>
          <p className="text-gray-600 mt-2">{t.users.subtitle}</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-syntalys-blue text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          + {t.users.addUser}
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">{t.users.totalUsers}</h3>
          <p className="text-3xl font-bold text-syntalys-blue">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">{t.users.activeUsers}</h3>
          <p className="text-3xl font-bold text-green-600">{activeUsers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">{t.users.inactiveUsers}</h3>
          <p className="text-3xl font-bold text-gray-600">{inactiveUsers}</p>
        </div>
      </div>

      {/* Lista de usuarios */}
      {users.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">{t.users.noUsers}</p>
          <button
            onClick={openAddModal}
            className="bg-syntalys-blue text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {t.users.createFirst}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.users.fullName}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.users.email}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.users.role}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.common.status}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.common.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-syntalys-blue rounded-full flex items-center justify-center text-white font-semibold">
                        {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.full_name || 'Sin nombre'}</div>
                        {user.phone && (
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'gestor' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.active ? t.users.userActive : t.users.userInactive}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-syntalys-blue hover:text-blue-700 mr-4"
                    >
                      {t.common.edit}
                    </button>
                    {user.id !== profile.id && (
                      <button
                        onClick={() => handleDelete(user.id, user.full_name || user.email)}
                        className="text-red-600 hover:text-red-700"
                      >
                        {t.common.delete}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Agregar/Editar Usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingUser ? t.users.editUserTitle : t.users.addUserTitle}
              </h2>
              <p className="text-gray-600 mt-1">{t.users.addUserSubtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.users.email} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                      placeholder={t.users.emailPlaceholder}
                      required
                      disabled={!!editingUser}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.users.fullName} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                      placeholder={t.users.namePlaceholder}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.users.phone}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                      placeholder={t.users.phonePlaceholder}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.users.role} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                    >
                      <option value="super_admin">{t.users.superAdmin}</option>
                      <option value="admin">{t.users.admin}</option>
                      <option value="gestor">{t.users.manager}</option>
                      <option value="empleado">{t.users.employee}</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.common.status}
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="h-4 w-4 text-syntalys-blue focus:ring-syntalys-blue border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        {t.users.userActive}
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {editingUser ? t.users.passwordNote : `${t.users.passwordPlaceholder} *`}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                      placeholder={t.users.passwordPlaceholder}
                      required={!editingUser}
                      minLength={6}
                    />
                    {editingUser && (
                      <p className="mt-1 text-sm text-gray-500">{t.users.passwordNote}</p>
                    )}
                  </div>
                </div>

                {/* Descripción del rol */}
                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">{t.users.roleDescription}:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li><strong>{t.users.superAdmin}:</strong> {t.users.superAdminDesc}</li>
                    <li><strong>{t.users.admin}:</strong> {t.users.adminDesc}</li>
                    <li><strong>{t.users.manager}:</strong> {t.users.managerDesc}</li>
                    <li><strong>{t.users.employee}:</strong> {t.users.employeeDesc}</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-syntalys-blue text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingUser ? t.common.saveChanges : t.users.addUser}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
