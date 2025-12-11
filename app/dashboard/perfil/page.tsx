'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function ProfilePage() {
  const { t } = useLanguage();
  const { profile, user, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile form state
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Sync state with profile when it loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Upload state
  const [uploading, setUploading] = useState(false);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return t.dashboard.superAdmin;
      case 'admin': return t.dashboard.admin;
      case 'gestor': return t.dashboard.manager;
      case 'empleado': return t.dashboard.employee;
      default: return role;
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, avatar_url: avatarUrl })
        .eq('id', user?.id);

      if (error) throw error;

      await refreshProfile();
      setProfileMessage({ type: 'success', text: t.profile.profileUpdated });
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileMessage({ type: 'error', text: 'Error al actualizar el perfil' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage(null);

    if (!currentPassword) {
      setPasswordMessage({ type: 'error', text: t.profile.currentPasswordRequired });
      setPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: t.profile.passwordMismatch });
      setPasswordLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: t.profile.passwordMinLength });
      setPasswordLoading(false);
      return;
    }

    try {
      // First verify current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        setPasswordMessage({ type: 'error', text: t.profile.incorrectPassword });
        setPasswordLoading(false);
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordMessage({ type: 'success', text: t.profile.passwordUpdated });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordMessage({ type: 'error', text: 'Error al actualizar la contraseña' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setUploading(true);
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage (bucket is 'avatars', file goes directly in root)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);

      // Update profile immediately
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      await refreshProfile();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.id) return;

    try {
      setAvatarUrl('');
      await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      await refreshProfile();
    } catch (error) {
      console.error('Error removing avatar:', error);
    }
  };

  const getInitials = () => {
    if (fullName) {
      return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t.profile.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t.profile.description}
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Picture Section */}
        <div className="bg-white dark:bg-gray-800 shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t.profile.profilePicture}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t.profile.profilePictureDesc}
          </p>

          <div className="flex items-center gap-6">
            {/* Avatar Preview */}
            <div className="relative">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-syntalys-blue flex items-center justify-center text-white text-2xl font-bold border-4 border-gray-200 dark:border-gray-600">
                  {getInitials()}
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>

            {/* Upload/Remove Buttons */}
            <div className="flex flex-col gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-syntalys-blue text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {t.profile.uploadPhoto}
              </button>
              {avatarUrl && (
                <button
                  onClick={handleRemoveAvatar}
                  className="px-4 py-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  {t.profile.removePhoto}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Personal Info Section */}
        <div className="bg-white dark:bg-gray-800 shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t.profile.personalInfo}
          </h2>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.profile.fullName}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t.profile.fullNamePlaceholder}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-syntalys-blue focus:border-transparent"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.profile.email}
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t.profile.emailNote}
              </p>
            </div>

            {/* Role (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.profile.role}
              </label>
              <input
                type="text"
                value={getRoleLabel(profile?.role || '')}
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* Success/Error Message */}
            {profileMessage && (
              <div className={`p-3 ${
                profileMessage.type === 'success'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {profileMessage.text}
              </div>
            )}

            {/* Save Button */}
            <button
              type="submit"
              disabled={profileLoading}
              className="px-6 py-2 bg-syntalys-blue text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {profileLoading ? t.common.loading + '...' : t.profile.saveProfile}
            </button>
          </form>
        </div>

        {/* Security Section */}
        <div className="bg-white dark:bg-gray-800 shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t.profile.security}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t.profile.changePassword}
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.profile.currentPassword}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-syntalys-blue focus:border-transparent"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.profile.newPassword}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-syntalys-blue focus:border-transparent"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.profile.confirmPassword}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-syntalys-blue focus:border-transparent"
              />
            </div>

            {/* Password Requirements */}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p className="font-medium">{t.profile.passwordRequirements}:</p>
              <ul className="list-disc list-inside mt-1">
                <li>{t.profile.passwordMinLength}</li>
              </ul>
            </div>

            {/* Success/Error Message */}
            {passwordMessage && (
              <div className={`p-3 ${
                passwordMessage.type === 'success'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {passwordMessage.text}
              </div>
            )}

            {/* Save Button */}
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-6 py-2 bg-syntalys-blue text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {passwordLoading ? t.common.loading + '...' : t.profile.savePassword}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
