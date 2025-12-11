'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { ClientIncome, Client, Currency, IncomeCategory } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';

export default function IngresosPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [incomes, setIncomes] = useState<ClientIncome[]>([]);
  const [oneTimeIncomes, setOneTimeIncomes] = useState<ClientIncome[]>([]);
  const [monthlyIncomes, setMonthlyIncomes] = useState<ClientIncome[]>([]);
  const [annualIncomes, setAnnualIncomes] = useState<ClientIncome[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<ClientIncome | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; openUp: boolean } | null>(null);
  const [expandedText, setExpandedText] = useState<{ text: string; title: string } | null>(null);

  const handleDropdownClick = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    if (openDropdown === id) {
      setOpenDropdown(null);
      setDropdownPosition(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < 120;
      setDropdownPosition({
        top: openUp ? rect.top - 8 : rect.bottom + 8,
        left: rect.right - 144,
        openUp
      });
      setOpenDropdown(id);
    }
  };

  const [formData, setFormData] = useState({
    client_id: '',
    service_name: '',
    description: '',
    amount: '',
    currency: 'CHF' as Currency,
    frequency: 'monthly' as 'one_time' | 'monthly' | 'annual',
    category: '' as IncomeCategory | '',
    status: 'pending' as 'paid' | 'pending' | 'upcoming',
    payment_date: '',
    renewal_date: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [incomesRes, clientsRes] = await Promise.all([
        supabase.from('client_income').select('*').order('created_at', { ascending: false }),
        supabase.from('clients').select('*').order('name', { ascending: true }),
      ]);

      if (incomesRes.error) throw incomesRes.error;
      if (clientsRes.error) throw clientsRes.error;

      const incomesData = incomesRes.data || [];
      setIncomes(incomesData);
      setOneTimeIncomes(incomesData.filter(i => i.frequency === 'one_time'));
      setMonthlyIncomes(incomesData.filter(i => i.frequency === 'monthly'));
      setAnnualIncomes(incomesData.filter(i => i.frequency === 'annual'));
      setClients(clientsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingIncome(null);
    setFormData({
      client_id: '',
      service_name: '',
      description: '',
      amount: '',
      currency: 'CHF',
      frequency: 'monthly',
      category: '',
      status: 'pending',
      payment_date: '',
      renewal_date: '',
    });
    setShowModal(true);
  }

  function openEditModal(income: ClientIncome) {
    setEditingIncome(income);
    setFormData({
      client_id: income.client_id,
      service_name: income.service_name,
      description: income.description || '',
      amount: income.amount.toString(),
      currency: income.currency,
      frequency: income.frequency,
      category: income.category || '',
      status: income.status,
      payment_date: income.payment_date || '',
      renewal_date: income.renewal_date || '',
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.client_id || !formData.service_name || !formData.amount) {
      alert(t.messages.fillRequired);
      return;
    }

    try {
      const incomeData = {
        client_id: formData.client_id,
        service_name: formData.service_name,
        description: formData.description || null,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        frequency: formData.frequency,
        category: formData.category || null,
        status: formData.status,
        payment_date: formData.payment_date || null,
        renewal_date: formData.renewal_date || null,
      };

      let error;
      if (editingIncome) {
        const { error: updateError } = await supabase
          .from('client_income')
          .update(incomeData)
          .eq('id', editingIncome.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('client_income')
          .insert([incomeData]);
        error = insertError;
      }

      if (error) {
        console.error('Error saving income:', error);
        alert(t.messages.saveError);
        return;
      }

      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert(t.messages.saveError);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t.messages.deleteConfirm + '?')) return;

    const { error } = await supabase
      .from('client_income')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting income:', error);
      alert(t.messages.deleteError);
    } else {
      loadData();
    }
  }

  function getClientName(clientId: string) {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'N/A';
  }

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.income.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t.income.subtitle}</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-green-600 text-white px-6 py-3 hover:bg-green-700 transition-colors font-medium shadow-sm"
        >
          + {t.income.addIncome}
        </button>
      </div>

      {/* Pagos Únicos */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.income.oneTimePayments}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-syntalys-blue dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-gray-300 uppercase tracking-wider">{t.income.client}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-gray-300 uppercase tracking-wider">{t.income.service}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-gray-300 uppercase tracking-wider">{t.income.category}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-gray-300 uppercase tracking-wider">{t.common.amount}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-gray-300 uppercase tracking-wider">{t.income.paymentDate}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-gray-300 uppercase tracking-wider">{t.common.status}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-gray-300 uppercase tracking-wider">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {oneTimeIncomes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400 dark:text-gray-500">
                    {t.income.noOneTimePayments}
                  </td>
                </tr>
              ) : (
                oneTimeIncomes.map((income, index) => (
                  <tr key={income.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-900 dark:text-white">{getClientName(income.client_id)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{income.service_name}</p>
                        {income.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {income.description.length > 40 ? (
                              <span>
                                {income.description.substring(0, 40)}...
                                <button
                                  onClick={() => setExpandedText({ text: income.description!, title: income.service_name })}
                                  className="ml-1 text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  {t.common.seeMore}
                                </button>
                              </span>
                            ) : income.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{income.category || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {income.currency} {income.amount.toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {income.payment_date ? new Date(income.payment_date).toLocaleDateString('es-ES') : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        income.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        income.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {income.status === 'paid' ? t.expenses.paid : income.status === 'pending' ? t.expenses.pending : t.expenses.upcoming}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={(e) => handleDropdownClick(e, `onetime-${income.id}`)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      >
                        <FaEllipsisV className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ingresos Mensuales */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.income.monthlyIncome}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-syntalys-blue dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-gray-300 uppercase tracking-wider">{t.income.client}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-gray-300 uppercase tracking-wider">{t.income.service}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-gray-300 uppercase tracking-wider">{t.income.category}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-gray-300 uppercase tracking-wider">{t.common.amount}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-gray-300 uppercase tracking-wider">{t.common.status}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-gray-300 uppercase tracking-wider">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {monthlyIncomes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400 dark:text-gray-500">
                    {t.income.noMonthlyIncome}
                  </td>
                </tr>
              ) : (
                monthlyIncomes.map((income, index) => (
                  <tr key={income.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-900 dark:text-white">{getClientName(income.client_id)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{income.service_name}</p>
                        {income.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {income.description.length > 40 ? (
                              <span>
                                {income.description.substring(0, 40)}...
                                <button
                                  onClick={() => setExpandedText({ text: income.description!, title: income.service_name })}
                                  className="ml-1 text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  {t.common.seeMore}
                                </button>
                              </span>
                            ) : income.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{income.category || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {income.currency} {income.amount.toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        income.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        income.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {income.status === 'paid' ? t.expenses.paid : income.status === 'pending' ? t.expenses.pending : t.expenses.upcoming}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={(e) => handleDropdownClick(e, `monthly-${income.id}`)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      >
                        <FaEllipsisV className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ingresos Anuales */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.income.annualIncome}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-syntalys-blue dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-gray-300 uppercase tracking-wider">{t.income.client}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-gray-300 uppercase tracking-wider">{t.income.service}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-gray-300 uppercase tracking-wider">{t.income.category}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-gray-300 uppercase tracking-wider">{t.common.amount}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-gray-300 uppercase tracking-wider">{t.income.renewalDate}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-gray-300 uppercase tracking-wider">{t.common.status}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white dark:text-gray-300 uppercase tracking-wider">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {annualIncomes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400 dark:text-gray-500">
                    {t.income.noAnnualIncome}
                  </td>
                </tr>
              ) : (
                annualIncomes.map((income, index) => (
                  <tr key={income.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-900 dark:text-white">{getClientName(income.client_id)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{income.service_name}</p>
                        {income.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {income.description.length > 40 ? (
                              <span>
                                {income.description.substring(0, 40)}...
                                <button
                                  onClick={() => setExpandedText({ text: income.description!, title: income.service_name })}
                                  className="ml-1 text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  {t.common.seeMore}
                                </button>
                              </span>
                            ) : income.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{income.category || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {income.currency} {income.amount.toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {income.renewal_date ? new Date(income.renewal_date).toLocaleDateString('es-ES') : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        income.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        income.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {income.status === 'paid' ? t.expenses.paid : income.status === 'pending' ? t.expenses.pending : t.expenses.upcoming}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={(e) => handleDropdownClick(e, `annual-${income.id}`)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      >
                        <FaEllipsisV className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingIncome ? t.common.edit + ' ' + t.income.title : t.income.addIncomeTitle}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{t.income.addIncomeSubtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.income.client} *
                  </label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">{t.forms.selectClient}</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.income.serviceName} *
                  </label>
                  <input
                    type="text"
                    value={formData.service_name}
                    onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t.forms.serviceNamePlaceholder}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.common.description}
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t.expenses.optionalDescription}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.common.amount} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.common.currency}
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="CHF">CHF</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.income.frequency}
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as 'one_time' | 'monthly' | 'annual' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="one_time">{t.income.oneTime}</option>
                    <option value="monthly">{t.expenses.monthly}</option>
                    <option value="annual">{t.expenses.annual}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.income.category}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as IncomeCategory | '' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{t.expenses.noCategory}</option>
                    <option value="web_development">{t.income.webDevelopment}</option>
                    <option value="maintenance">{t.income.maintenance}</option>
                    <option value="hosting">{t.income.hosting}</option>
                    <option value="domain">{t.income.domain}</option>
                    <option value="crm">{t.income.crm}</option>
                    <option value="subscription">{t.income.subscription}</option>
                    <option value="other">{t.income.other}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.common.status}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'paid' | 'pending' | 'upcoming' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="paid">{t.expenses.paid}</option>
                    <option value="pending">{t.expenses.pending}</option>
                    <option value="upcoming">{t.expenses.upcoming}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.income.paymentDate}
                  </label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {(formData.frequency === 'monthly' || formData.frequency === 'annual') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.income.renewalDate}
                    </label>
                    <input
                      type="date"
                      value={formData.renewal_date}
                      onChange={(e) => setFormData({ ...formData, renewal_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-3 hover:bg-green-700 transition-colors font-medium"
                >
                  {editingIncome ? t.common.saveChanges : t.common.save}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  {t.common.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para ver texto completo */}
      {expandedText && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{expandedText.title}</h3>
              <button
                onClick={() => setExpandedText(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{expandedText.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown fijo para ingresos */}
      {openDropdown && dropdownPosition && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpenDropdown(null); setDropdownPosition(null); }} />
          <div
            className="fixed w-36 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 z-50"
            style={{
              top: dropdownPosition.openUp ? 'auto' : dropdownPosition.top,
              bottom: dropdownPosition.openUp ? window.innerHeight - dropdownPosition.top : 'auto',
              left: dropdownPosition.left
            }}
          >
            <button
              onClick={() => {
                const incomeId = openDropdown.replace(/^(onetime-|monthly-|annual-)/, '');
                const income = incomes.find(i => i.id === incomeId);
                if (income) openEditModal(income);
                setOpenDropdown(null);
                setDropdownPosition(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
            >
              {t.common.edit}
            </button>
            <button
              onClick={() => {
                const incomeId = openDropdown.replace(/^(onetime-|monthly-|annual-)/, '');
                handleDelete(incomeId);
                setOpenDropdown(null);
                setDropdownPosition(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
            >
              {t.common.delete}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
