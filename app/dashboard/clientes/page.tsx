'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Client, ClientWithDetails, ClientExpense, ClientIncome } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ClientesPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ClientWithDetails[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
  });

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    setLoading(true);
    try {
      // Cargar clientes
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('company_name', { ascending: true });

      if (clientsError) {
        console.error('Error loading clients:', clientsError);
        return;
      }

      // Cargar gastos de clientes
      const { data: expensesData, error: expensesError } = await supabase
        .from('client_expenses')
        .select('*');

      // Cargar ingresos de clientes
      const { data: incomeData, error: incomeError } = await supabase
        .from('client_income')
        .select('*');

      if (expensesError || incomeError) {
        console.error('Error loading client data:', expensesError || incomeError);
        return;
      }

      // Combinar datos
      const clientsWithDetails: ClientWithDetails[] = (clientsData || []).map(client => {
        const clientExpenses = (expensesData || []).filter(e => e.client_id === client.id);
        const clientIncome = (incomeData || []).filter(i => i.client_id === client.id);

        const totalExpensesMonthly = clientExpenses
          .filter(e => e.frequency === 'monthly')
          .reduce((sum, e) => sum + Number(e.amount), 0);

        const totalExpensesAnnual = clientExpenses
          .filter(e => e.frequency === 'annual')
          .reduce((sum, e) => sum + Number(e.amount), 0);

        const totalIncomeMonthly = clientIncome
          .filter(i => i.frequency === 'monthly')
          .reduce((sum, i) => sum + Number(i.amount), 0);

        const totalIncomeAnnual = clientIncome
          .filter(i => i.frequency === 'annual')
          .reduce((sum, i) => sum + Number(i.amount), 0);

        return {
          ...client,
          expenses: clientExpenses,
          income: clientIncome,
          total_expenses_monthly: totalExpensesMonthly,
          total_expenses_annual: totalExpensesAnnual,
          total_income_monthly: totalIncomeMonthly,
          total_income_annual: totalIncomeAnnual,
          profit_monthly: totalIncomeMonthly - totalExpensesMonthly,
          profit_annual: totalIncomeAnnual - totalExpensesAnnual,
        };
      });

      setClients(clientsWithDetails);
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
          company_name: formData.company_name,
          contact_name: formData.contact_name || null,
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          notes: formData.notes || null,
          status: formData.status,
        }]);

      if (error) {
        console.error('Error adding client:', error);
        alert(t.messages.saveError + ': ' + error.message);
        return;
      }

      // Resetear formulario y recargar
      setFormData({
        company_name: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        notes: '',
        status: 'active'
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
          company_name: formData.company_name,
          contact_name: formData.contact_name || null,
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          notes: formData.notes || null,
          status: formData.status,
        })
        .eq('id', selectedClient.id);

      if (error) {
        console.error('Error updating client:', error);
        alert(t.messages.saveError);
        return;
      }

      // Resetear formulario y recargar
      setFormData({
        company_name: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        notes: '',
        status: 'active'
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
      company_name: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      notes: '',
      status: 'active'
    });
    setShowAddModal(true);
  }

  function openEditModal(client: Client) {
    setSelectedClient(client);
    setFormData({
      company_name: client.company_name,
      contact_name: client.contact_name || '',
      contact_email: client.contact_email || '',
      contact_phone: client.contact_phone || '',
      notes: client.notes || '',
      status: client.status,
    });
    setShowEditModal(true);
  }

  // Calcular totales generales
  const totalClientsExpensesAnnual = clients.reduce((sum, c) => sum + (c.total_expenses_annual || 0), 0);
  const totalClientsIncomeAnnual = clients.reduce((sum, c) => sum + (c.total_income_annual || 0), 0);
  const totalClientsProfitAnnual = totalClientsIncomeAnnual - totalClientsExpensesAnnual;

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

      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">{t.clients.totalClients}</h3>
          <p className="text-3xl font-bold text-syntalys-blue">{clients.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">{t.clients.clientExpenses}</h3>
          <p className="text-3xl font-bold text-orange-600">{totalClientsExpensesAnnual.toFixed(2)} CHF</p>
          <p className="text-xs text-gray-400 mt-1">{t.clients.clientExpensesSubtitle}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">{t.clients.totalIncome}</h3>
          <p className="text-3xl font-bold text-green-600">{totalClientsIncomeAnnual.toFixed(2)} CHF</p>
          <p className="text-xs text-gray-400 mt-1">{t.clients.totalIncomeSubtitle}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">{t.clients.totalProfit}</h3>
          <p className={`text-3xl font-bold ${totalClientsProfitAnnual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalClientsProfitAnnual.toFixed(2)} CHF
          </p>
          <p className="text-xs text-gray-400 mt-1">{t.clients.totalProfitSubtitle}</p>
        </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {clients.map((client) => (
            <div key={client.id} className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{client.company_name}</h3>
                    <div className="mt-2 space-y-1">
                      {client.contact_name && (
                        <p className="text-sm text-gray-600">👤 {client.contact_name}</p>
                      )}
                      {client.contact_email && (
                        <p className="text-sm text-gray-600">📧 {client.contact_email}</p>
                      )}
                      {client.contact_phone && (
                        <p className="text-sm text-gray-600">📱 {client.contact_phone}</p>
                      )}
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                        client.status === 'active' ? 'bg-green-100 text-green-800' :
                        client.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {client.status === 'active' ? t.clients.active : client.status === 'inactive' ? t.clients.inactive : t.clients.suspended}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(client)}
                      className="text-syntalys-blue hover:text-blue-700 px-3 py-1 text-sm font-medium"
                    >
                      {t.common.edit}
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id, client.company_name)}
                      className="text-red-600 hover:text-red-700 px-3 py-1 text-sm font-medium"
                    >
                      {t.common.delete}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">{t.clients.annualExpenses}</p>
                    <p className="text-lg font-bold text-red-600">
                      {(client.total_expenses_annual || 0).toFixed(2)} CHF
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">{t.clients.annualIncome}</p>
                    <p className="text-lg font-bold text-green-600">
                      {(client.total_income_annual || 0).toFixed(2)} CHF
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">{t.clients.annualProfit}</p>
                    <p className={`text-lg font-bold ${(client.profit_annual || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(client.profit_annual || 0).toFixed(2)} CHF
                    </p>
                  </div>
                </div>

                {(client.expenses && client.expenses.length > 0) || (client.income && client.income.length > 0) ? (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2">{t.nav.expenses} ({client.expenses?.length || 0})</p>
                      {client.expenses && client.expenses.length > 0 ? (
                        <div className="space-y-1">
                          {client.expenses.slice(0, 3).map((expense) => (
                            <p key={expense.id} className="text-xs text-gray-600">
                              • {expense.service_name}: {Number(expense.amount).toFixed(2)} {expense.currency}
                            </p>
                          ))}
                          {client.expenses.length > 3 && (
                            <p className="text-xs text-gray-400">+ {client.expenses.length - 3} {t.common.more}...</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">{t.common.none} {t.nav.expenses.toLowerCase()}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2">{t.nav.income} ({client.income?.length || 0})</p>
                      {client.income && client.income.length > 0 ? (
                        <div className="space-y-1">
                          {client.income.slice(0, 3).map((income) => (
                            <p key={income.id} className="text-xs text-gray-600">
                              • {income.service_name}: {Number(income.amount).toFixed(2)} {income.currency}
                            </p>
                          ))}
                          {client.income.length > 3 && (
                            <p className="text-xs text-gray-400">+ {client.income.length - 3} {t.common.more}...</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">{t.common.none} {t.nav.income.toLowerCase()}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center pt-4 border-t border-gray-200">
                    {t.common.none} {t.nav.expenses.toLowerCase()} ni {t.nav.income.toLowerCase()} registrados
                  </p>
                )}
              </div>
            </div>
          ))}
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
                  {t.clients.companyName} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                  placeholder="Ej: Acme Corp"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.clients.contactName}
                  </label>
                  <input
                    type="text"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.clients.contactEmail}
                  </label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                    placeholder="email@ejemplo.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.clients.contactPhone}
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                  placeholder="+41 xx xxx xx xx"
                />
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
                disabled={!formData.company_name.trim()}
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
                  {t.clients.companyName} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                  placeholder="Ej: Acme Corp"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.clients.contactName}
                  </label>
                  <input
                    type="text"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.clients.contactEmail}
                  </label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                    placeholder="email@ejemplo.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.clients.contactPhone}
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-syntalys-blue"
                  placeholder="+41 xx xxx xx xx"
                />
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
                disabled={!formData.company_name.trim()}
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
