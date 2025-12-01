'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Client } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ClientesPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    is_potential: false,
  });

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading clients:', error);
        return;
      }

      setClients(data || []);
    } catch (error) {
      console.error('Error in loadClients:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddClient() {
    try {
      // Get the current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error getting user:', userError);
        alert(t.messages.saveError + ': Usuario no autenticado');
        return;
      }

      const { error } = await supabase
        .from('clients')
        .insert([{
          user_id: user.id,
          name: formData.name,
          company_name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          notes: formData.notes || null,
          status: formData.status,
          is_potential: formData.is_potential,
        }]);

      if (error) {
        console.error('Error adding client:', error);
        alert(t.messages.saveError + ': ' + error.message);
        return;
      }

      // Resetear formulario y recargar
      setFormData({
        name: '',
        email: '',
        phone: '',
        notes: '',
        status: 'active',
        is_potential: false,
      });
      setShowAddModal(false);
      loadClients();
    } catch (error) {
      console.error('Error in handleAddClient:', error);
      alert(t.messages.saveError);
    }
  }

  async function handleEditClient() {
    if (!selectedClient) return;

    try {
      const { error } = await supabase
        .from('clients')
        .update({
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          notes: formData.notes || null,
          status: formData.status,
          is_potential: formData.is_potential,
        })
        .eq('id', selectedClient.id);

      if (error) {
        console.error('Error updating client:', error);
        alert(t.messages.saveError);
        return;
      }

      // Resetear formulario y recargar
      setFormData({
        name: '',
        email: '',
        phone: '',
        notes: '',
        status: 'active',
        is_potential: false,
      });
      setShowEditModal(false);
      setSelectedClient(null);
      loadClients();
    } catch (error) {
      console.error('Error in handleEditClient:', error);
      alert(t.messages.saveError);
    }
  }

  async function handleDeleteClient(clientId: string, clientName: string) {
    if (!confirm(`${t.messages.deleteConfirm} "${clientName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) {
        console.error('Error deleting client:', error);
        alert(t.messages.deleteError);
        return;
      }

      loadClients();
    } catch (error) {
      console.error('Error in handleDeleteClient:', error);
      alert(t.messages.deleteError);
    }
  }

  function openAddModal() {
    setFormData({
      name: '',
      email: '',
      phone: '',
      notes: '',
      status: 'active',
      is_potential: false,
    });
    setShowAddModal(true);
  }

  function openEditModal(client: Client) {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      notes: client.notes || '',
      status: client.status,
      is_potential: client.is_potential || false,
    });
    setShowEditModal(true);
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">{t.common.loading}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.clients.title}</h1>
          <p className="text-gray-600 mt-2">
            {t.clients.subtitle}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-syntalys-blue text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          + {t.clients.addClient}
        </button>
      </div>

      {/* Lista de clientes */}
      {clients.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">{t.clients.noClients}</p>
          <button
            onClick={openAddModal}
            className="bg-syntalys-blue text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {t.clients.createFirst}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.forms.name}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.forms.email}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.forms.phone}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.common.type}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.common.status}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.common.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{client.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{client.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{client.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.is_potential ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {t.clients.potential}
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {t.common.client}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        client.status === 'active' ? 'bg-green-100 text-green-800' :
                        client.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {client.status === 'active' ? t.clients.active : client.status === 'inactive' ? t.clients.inactive : t.clients.suspended}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(client)}
                        className="text-syntalys-blue hover:text-blue-700 mr-3"
                      >
                        {t.common.edit}
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id, client.name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        {t.common.delete}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Agregar Cliente */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{t.clients.addClient}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.forms.name} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.forms.email}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                    placeholder="email@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.forms.phone}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                    placeholder="+41 xx xxx xx xx"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.common.notes}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                  rows={3}
                  placeholder="Notas adicionales sobre el cliente"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.common.status}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                  >
                    <option value="active">{t.clients.active}</option>
                    <option value="inactive">{t.clients.inactive}</option>
                    <option value="suspended">{t.clients.suspended}</option>
                  </select>
                </div>
                <div className="flex items-center pt-7">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_potential}
                      onChange={(e) => setFormData({ ...formData, is_potential: e.target.checked })}
                      className="w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">{t.clients.isPotential}</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleAddClient}
                disabled={!formData.name.trim()}
                className="px-4 py-2 bg-syntalys-blue text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t.clients.addClient}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Cliente */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{t.clients.editClient}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.forms.name} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.forms.email}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                    placeholder="email@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.forms.phone}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                    placeholder="+41 xx xxx xx xx"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.common.notes}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                  rows={3}
                  placeholder="Notas adicionales sobre el cliente"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.common.status}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                  >
                    <option value="active">{t.clients.active}</option>
                    <option value="inactive">{t.clients.inactive}</option>
                    <option value="suspended">{t.clients.suspended}</option>
                  </select>
                </div>
                <div className="flex items-center pt-7">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_potential}
                      onChange={(e) => setFormData({ ...formData, is_potential: e.target.checked })}
                      className="w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">{t.clients.isPotential}</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedClient(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleEditClient}
                disabled={!formData.name.trim()}
                className="px-4 py-2 bg-syntalys-blue text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t.common.saveChanges}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
