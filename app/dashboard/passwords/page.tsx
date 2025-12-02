'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Password, PasswordCategory, UserRole } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaEye, FaEyeSlash, FaCopy, FaCheck, FaLink, FaLock, FaPlus } from 'react-icons/fa';

export default function PasswordsPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPassword, setSelectedPassword] = useState<Password | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    service_name: '',
    username: '',
    email: '',
    password: '',
    url: '',
    notes: '',
    category: 'other' as PasswordCategory,
  });

  const categories: PasswordCategory[] = ['work', 'personal', 'social', 'banking', 'email', 'hosting', 'development', 'other'];

  const loadUserRole = useCallback(async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return null;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) return null;

      setUserRole(profile.role as UserRole);
      const superAdmin = profile.role === 'super_admin';
      setIsSuperAdmin(superAdmin);
      return { userId: user.id, role: profile.role as UserRole, isSuperAdmin: superAdmin };
    } catch (error) {
      console.error('Error loading user role:', error);
      return null;
    }
  }, []);

  const loadPasswords = useCallback(async (userInfo?: { userId: string; role: UserRole; isSuperAdmin: boolean } | null) => {
    setLoading(true);
    try {
      // Get user info if not provided
      const info = userInfo ?? await loadUserRole();

      if (!info) {
        console.error('Could not get user info');
        setPasswords([]);
        return;
      }

      // If super_admin, load all passwords from all super_admins
      // Otherwise, load only the user's own passwords
      if (info.isSuperAdmin) {
        // Get all super_admin user IDs
        const { data: superAdmins, error: adminsError } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'super_admin');

        if (adminsError) {
          console.error('Error loading super admins:', adminsError);
          return;
        }

        const superAdminIds = superAdmins?.map(admin => admin.id) || [];

        // Load all passwords from super_admins
        const { data, error } = await supabase
          .from('passwords')
          .select('*')
          .in('user_id', superAdminIds)
          .order('service_name', { ascending: true });

        if (error) {
          console.error('Error loading passwords:', error);
          return;
        }

        setPasswords(data || []);
      } else {
        // Non-super_admins see only their own passwords
        const { data, error } = await supabase
          .from('passwords')
          .select('*')
          .eq('user_id', info.userId)
          .order('service_name', { ascending: true });

        if (error) {
          console.error('Error loading passwords:', error);
          return;
        }

        setPasswords(data || []);
      }
    } catch (error) {
      console.error('Error in loadPasswords:', error);
    } finally {
      setLoading(false);
    }
  }, [loadUserRole]);

  useEffect(() => {
    loadPasswords(null);
  }, [loadPasswords]);

  async function handleAddPassword() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error getting user:', userError);
        alert(t.messages.saveError + ': Usuario no autenticado');
        return;
      }

      const { error } = await supabase
        .from('passwords')
        .insert([{
          user_id: user.id,
          service_name: formData.service_name,
          username: formData.username || null,
          email: formData.email || null,
          password: formData.password,
          url: formData.url || null,
          notes: formData.notes || null,
          category: formData.category,
        }]);

      if (error) {
        console.error('Error adding password:', error);
        alert(t.messages.saveError + ': ' + error.message);
        return;
      }

      resetForm();
      setShowAddModal(false);
      loadPasswords(null);
    } catch (error) {
      console.error('Error in handleAddPassword:', error);
      alert(t.messages.saveError);
    }
  }

  async function handleEditPassword() {
    if (!selectedPassword) return;

    try {
      const { error } = await supabase
        .from('passwords')
        .update({
          service_name: formData.service_name,
          username: formData.username || null,
          email: formData.email || null,
          password: formData.password,
          url: formData.url || null,
          notes: formData.notes || null,
          category: formData.category,
        })
        .eq('id', selectedPassword.id);

      if (error) {
        console.error('Error updating password:', error);
        alert(t.messages.saveError);
        return;
      }

      resetForm();
      setShowEditModal(false);
      setSelectedPassword(null);
      loadPasswords(null);
    } catch (error) {
      console.error('Error in handleEditPassword:', error);
      alert(t.messages.saveError);
    }
  }

  async function handleDeletePassword(passwordId: string, serviceName: string) {
    if (!confirm(`${t.messages.deleteConfirm} "${serviceName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('passwords')
        .delete()
        .eq('id', passwordId);

      if (error) {
        console.error('Error deleting password:', error);
        alert(t.messages.deleteError);
        return;
      }

      loadPasswords(null);
    } catch (error) {
      console.error('Error in handleDeletePassword:', error);
      alert(t.messages.deleteError);
    }
  }

  function resetForm() {
    setFormData({
      service_name: '',
      username: '',
      email: '',
      password: '',
      url: '',
      notes: '',
      category: 'other',
    });
  }

  function openAddModal() {
    resetForm();
    setShowAddModal(true);
  }

  function openEditModal(password: Password) {
    setSelectedPassword(password);
    setFormData({
      service_name: password.service_name,
      username: password.username || '',
      email: password.email || '',
      password: password.password,
      url: password.url || '',
      notes: password.notes || '',
      category: password.category || 'other',
    });
    setShowEditModal(true);
  }

  function openViewModal(password: Password) {
    setSelectedPassword(password);
    setShowViewModal(true);
  }

  function togglePasswordVisibility(id: string) {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }

  async function copyToClipboard(text: string, fieldId: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  }

  function generatePassword(length: number = 16) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }
    setFormData({ ...formData, password });
  }

  const getCategoryLabel = (category: PasswordCategory | null): string => {
    if (!category) return t.passwords.categoryOther;
    const labels: Record<PasswordCategory, string> = {
      work: t.passwords.categoryWork,
      personal: t.passwords.categoryPersonal,
      social: t.passwords.categorySocial,
      banking: t.passwords.categoryBanking,
      email: t.passwords.categoryEmail,
      hosting: t.passwords.categoryHosting,
      development: t.passwords.categoryDevelopment,
      other: t.passwords.categoryOther,
    };
    return labels[category];
  };

  const getCategoryColor = (category: PasswordCategory | null): string => {
    const colors: Record<PasswordCategory, string> = {
      work: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      personal: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      social: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      banking: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      email: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      hosting: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      development: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[category || 'other'];
  };

  // Filter passwords
  const filteredPasswords = passwords.filter(pwd => {
    const matchesSearch = pwd.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pwd.username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pwd.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || pwd.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">{t.common.loading}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.passwords.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t.passwords.subtitle}</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-syntalys-blue text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <FaPlus className="w-4 h-4" /> {t.passwords.addPassword}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.passwords.totalPasswords}</div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{passwords.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.passwords.workAccounts}</div>
          <div className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
            {passwords.filter(p => p.category === 'work').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.passwords.personalAccounts}</div>
          <div className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">
            {passwords.filter(p => p.category === 'personal').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.passwords.bankingAccounts}</div>
          <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
            {passwords.filter(p => p.category === 'banking').length}
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t.passwords.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">{t.passwords.allCategories}</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Passwords List */}
      {filteredPasswords.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <FaLock className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">{t.passwords.noPasswords}</p>
          <button
            onClick={openAddModal}
            className="bg-syntalys-blue text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {t.passwords.createFirst}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPasswords.map((password) => (
            <div key={password.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{password.service_name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{password.username || password.email || '-'}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(password.category)}`}>
                    {getCategoryLabel(password.category)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {password.email && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <span className="w-20 font-medium">{t.forms.email}:</span>
                      <span className="truncate flex-1">{password.email}</span>
                      <button
                        onClick={() => copyToClipboard(password.email!, `email-${password.id}`)}
                        className="ml-2 text-gray-400 hover:text-syntalys-blue dark:hover:text-blue-400"
                        title={t.passwords.copy}
                      >
                        {copiedField === `email-${password.id}` ? <FaCheck className="w-4 h-4 text-green-500" /> : <FaCopy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                  {password.username && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <span className="w-20 font-medium">{t.passwords.username}:</span>
                      <span className="truncate flex-1">{password.username}</span>
                      <button
                        onClick={() => copyToClipboard(password.username!, `user-${password.id}`)}
                        className="ml-2 text-gray-400 hover:text-syntalys-blue dark:hover:text-blue-400"
                        title={t.passwords.copy}
                      >
                        {copiedField === `user-${password.id}` ? <FaCheck className="w-4 h-4 text-green-500" /> : <FaCopy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <span className="w-20 font-medium">{t.passwords.password}:</span>
                    <span className="truncate flex-1 font-mono">
                      {visiblePasswords[password.id] ? password.password : '••••••••••••'}
                    </span>
                    <button
                      onClick={() => togglePasswordVisibility(password.id)}
                      className="ml-2 text-gray-400 hover:text-syntalys-blue dark:hover:text-blue-400"
                      title={visiblePasswords[password.id] ? t.passwords.hide : t.passwords.show}
                    >
                      {visiblePasswords[password.id] ? <FaEye className="w-4 h-4" /> : <FaEyeSlash className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(password.password, `pwd-${password.id}`)}
                      className="ml-2 text-gray-400 hover:text-syntalys-blue dark:hover:text-blue-400"
                      title={t.passwords.copy}
                    >
                      {copiedField === `pwd-${password.id}` ? <FaCheck className="w-4 h-4 text-green-500" /> : <FaCopy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {password.url && (
                  <a
                    href={password.url.startsWith('http') ? password.url : `https://${password.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-syntalys-blue dark:text-blue-400 hover:underline flex items-center gap-2 truncate mb-4"
                  >
                    <FaLink className="w-3 h-3 flex-shrink-0" /> <span className="truncate">{password.url}</span>
                  </a>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => openViewModal(password)}
                    className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    {t.passwords.view}
                  </button>
                  <button
                    onClick={() => openEditModal(password)}
                    className="px-3 py-1.5 text-sm text-syntalys-blue dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                  >
                    {t.common.edit}
                  </button>
                  <button
                    onClick={() => handleDeletePassword(password.id, password.service_name)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    {t.common.delete}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.passwords.addPassword}</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{t.passwords.addPasswordSubtitle}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.passwords.serviceName} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.service_name}
                  onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t.passwords.serviceNamePlaceholder}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.passwords.username}
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t.passwords.usernamePlaceholder}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.forms.email}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.passwords.password} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={visiblePasswords['form'] ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('form')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {visiblePasswords['form'] ? <FaEye className="w-4 h-4" /> : <FaEyeSlash className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => generatePassword()}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
                  >
                    {t.passwords.generate}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.passwords.category}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as PasswordCategory })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.common.notes}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder={t.passwords.notesPlaceholder}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleAddPassword}
                disabled={!formData.service_name.trim() || !formData.password.trim()}
                className="px-4 py-2 bg-syntalys-blue text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t.passwords.addPassword}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.passwords.editPassword}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.passwords.serviceName} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.service_name}
                  onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.passwords.username}
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.forms.email}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.passwords.password} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={visiblePasswords['form-edit'] ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('form-edit')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {visiblePasswords['form-edit'] ? <FaEye className="w-4 h-4" /> : <FaEyeSlash className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => generatePassword()}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
                  >
                    {t.passwords.generate}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.passwords.category}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as PasswordCategory })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.common.notes}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedPassword(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleEditPassword}
                disabled={!formData.service_name.trim() || !formData.password.trim()}
                className="px-4 py-2 bg-syntalys-blue text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t.common.saveChanges}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPassword.service_name}</h2>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${getCategoryColor(selectedPassword.category)}`}>
                {getCategoryLabel(selectedPassword.category)}
              </span>
            </div>
            <div className="p-6 space-y-4">
              {selectedPassword.username && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.passwords.username}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-900 dark:text-white">{selectedPassword.username}</span>
                    <button
                      onClick={() => copyToClipboard(selectedPassword.username!, 'view-user')}
                      className="text-gray-400 hover:text-syntalys-blue dark:hover:text-blue-400"
                    >
                      {copiedField === 'view-user' ? <FaCheck className="w-4 h-4 text-green-500" /> : <FaCopy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
              {selectedPassword.email && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.forms.email}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-900 dark:text-white">{selectedPassword.email}</span>
                    <button
                      onClick={() => copyToClipboard(selectedPassword.email!, 'view-email')}
                      className="text-gray-400 hover:text-syntalys-blue dark:hover:text-blue-400"
                    >
                      {copiedField === 'view-email' ? <FaCheck className="w-4 h-4 text-green-500" /> : <FaCopy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.passwords.password}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-900 dark:text-white font-mono">
                    {visiblePasswords['view'] ? selectedPassword.password : '••••••••••••'}
                  </span>
                  <button
                    onClick={() => togglePasswordVisibility('view')}
                    className="text-gray-400 hover:text-syntalys-blue dark:hover:text-blue-400"
                  >
                    {visiblePasswords['view'] ? <FaEye className="w-4 h-4" /> : <FaEyeSlash className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(selectedPassword.password, 'view-pwd')}
                    className="text-gray-400 hover:text-syntalys-blue dark:hover:text-blue-400"
                  >
                    {copiedField === 'view-pwd' ? <FaCheck className="w-4 h-4 text-green-500" /> : <FaCopy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {selectedPassword.url && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">URL</span>
                  <a
                    href={selectedPassword.url.startsWith('http') ? selectedPassword.url : `https://${selectedPassword.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-syntalys-blue dark:text-blue-400 hover:underline"
                  >
                    {selectedPassword.url}
                  </a>
                </div>
              )}
              {selectedPassword.notes && (
                <div className="py-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">{t.common.notes}</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">{selectedPassword.notes}</p>
                </div>
              )}
              <div className="text-xs text-gray-400 dark:text-gray-500 pt-4">
                {t.passwords.createdAt}: {new Date(selectedPassword.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedPassword(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t.common.close}
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedPassword);
                }}
                className="px-4 py-2 bg-syntalys-blue text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {t.common.edit}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
